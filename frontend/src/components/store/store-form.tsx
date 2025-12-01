'use client';

import { FormInput } from '@/components/forms/form-input';
import { FormTextarea } from '@/components/forms/form-textarea';
import { FormFileUpload } from '@/components/forms/form-file-upload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useCreateLoja, useUpdateLoja, useGetLojaById } from '@/lib/queries/useLoja';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const formSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres.'),
  descricao: z.string().optional(),
  logo: z
    .instanceof(File)
    .refine((f) => f.size <= MAX_FILE_SIZE, 'Máximo 5MB')
    .refine((f) => ACCEPTED_IMAGE_TYPES.includes(f.type), 'Apenas imagens')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  banner: z
    .instanceof(File)
    .refine((f) => f.size <= MAX_FILE_SIZE, 'Máximo 5MB')
    .refine((f) => ACCEPTED_IMAGE_TYPES.includes(f.type), 'Apenas imagens')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  emailComercial: z.string().email('Email inválido').optional().or(z.literal('')),
  telefoneComercial: z.string().optional(),
  enderecoComercial: z
    .object({
      rua: z.string().optional(),
      numero: z.string().optional(),
      bairro: z.string().optional(),
      cidade: z.string().optional(),
      estado: z.string().optional(),
      cep: z.string().optional(),
      complemento: z.string().optional(),
    })
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface StoreFormProps {
  storeId?: string;
}

export default function StoreForm({ storeId }: StoreFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { mutate: create } = useCreateLoja();
  const { mutate: update } = useUpdateLoja();
  
  const { data: store, isLoading: isFetching } = useGetLojaById(
    storeId || ''
  );

  const defaultValues: FormValues = {
    nome: '',
    descricao: '',
    emailComercial: '',
    telefoneComercial: '',
    enderecoComercial: {
      rua: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
      complemento: '',
    },
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: 'onChange', 
  });

  useEffect(() => {
    if (store && storeId) {
      form.reset({
        nome: store.nome || '',
        descricao: store.descricao || '',
        emailComercial: store.emailComercial || '',
        telefoneComercial: store.telefoneComercial || '',
        enderecoComercial: {
          rua: store.enderecoComercial?.rua || '',
          numero: store.enderecoComercial?.numero || '',
          bairro: store.enderecoComercial?.bairro || '',
          cidade: store.enderecoComercial?.cidade || '',
          estado: store.enderecoComercial?.estado || '',
          cep: store.enderecoComercial?.cep || '',
          complemento: store.enderecoComercial?.complemento || '',
        },
      });
    }
  }, [store, storeId, form]);

  async function onSubmit(values: FormValues) {
    try {
      setIsLoading(true);
      const formData = new FormData();

      if (values.nome) formData.append('nome', values.nome);
      if (values.descricao) formData.append('descricao', values.descricao);
      if (values.emailComercial) formData.append('emailComercial', values.emailComercial);
      if (values.telefoneComercial) formData.append('telefoneComercial', values.telefoneComercial);

      if (values.logo instanceof File && values.logo.size > 0) {
        formData.append('logo', values.logo);
      }
      if (values.banner instanceof File && values.banner.size > 0) {
        formData.append('banner', values.banner);
      }

      if (values.enderecoComercial) {
        const endereco = values.enderecoComercial;
        const enderecoLimpo = Object.fromEntries(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          Object.entries(endereco).filter(([_, v]) => v !== '' && v !== undefined)
        );
        
        if (Object.keys(enderecoLimpo).length > 0) {
          formData.append('enderecoComercial', JSON.stringify(enderecoLimpo));
        }
      }

      const action = storeId ? update : create;
      const payload = storeId ? { id: storeId, body: formData } : formData;

      action(payload as any, {
        onSuccess: () => {
          toast.success(
            storeId ? 'Loja atualizada com sucesso!' : 'Loja criada com sucesso!',
            {
              description: storeId 
                ? 'As informações da loja foram atualizadas.' 
                : 'Sua loja foi cadastrada e está aguardando aprovação.',
              duration: 4000,
            }
          );
          router.push('/dashboard/store');
          router.refresh();
        },
        onError: (error: any) => {
          
          // Tratamento de erros específicos
          const errorMessage = error?.response?.data?.error?.message 
            || error?.message 
            || 'Erro ao salvar loja';
          
          const errorCode = error?.response?.data?.error?.code;

          if (errorCode === 'VALIDATION_ERROR') {
            toast.error('Erro de validação', {
              description: errorMessage,
              duration: 5000,
            });
          } else if (errorMessage.includes('enderecoComercial')) {
            toast.error('Erro no endereço', {
              description: 'Verifique se os dados do endereço estão corretos.',
              duration: 5000,
            });
          } else {
            toast.error('Erro ao salvar', {
              description: errorMessage,
              duration: 5000,
            });
          }
        },
        onSettled: () => setIsLoading(false),
      });
    } catch (error) {
      toast.error('Erro inesperado', {
        description: 'Ocorreu um erro ao processar o formulário. Tente novamente.',
        duration: 5000,
      });
      setIsLoading(false);
    }
  }

  if (isFetching && storeId) {
    return (
      <Card className="mx-auto w-full max-w-4xl">
        <CardContent className="py-10">
          <div className="flex items-center justify-center">
            <div className="text-muted-foreground">Carregando...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto w-full shadow-sm">
      <CardHeader className="space-y-1 border-b bg-muted/50">
        <CardTitle className="text-2xl font-bold">
          {storeId ? 'Editar Loja' : 'Criar Nova Loja'}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {storeId 
            ? 'Atualize as informações da sua loja' 
            : 'Preencha os dados para cadastrar uma nova loja'}
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormInput 
              control={form.control} 
              name="nome" 
              label="Nome da Loja" 
              placeholder="Ex: Loja do João"
              required 
            />
            <FormInput 
              control={form.control} 
              name="emailComercial" 
              label="Email Comercial" 
              type="email"
              placeholder="contato@minhaloja.com"
            />
          </div>

          <FormInput 
            control={form.control} 
            name="telefoneComercial" 
            label="Telefone Comercial"
            placeholder="+244 923 456 789"
          />

          <FormTextarea 
            control={form.control} 
            name="descricao" 
            label="Descrição da Loja"
            placeholder="Descreva sua loja, produtos e serviços oferecidos..."
          />

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Identidade Visual</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <FormFileUpload
                  control={form.control}
                  name="logo"
                  label="Logo da Loja"
                  config={{ maxFiles: 1, acceptedTypes: ACCEPTED_IMAGE_TYPES }}
                />
                <p className="text-xs text-muted-foreground">
                  Recomendado: 512x512px, formato PNG com fundo transparente
                </p>
              </div>
              <div className="space-y-2">
                <FormFileUpload
                  control={form.control}
                  name="banner"
                  label="Banner da Loja"
                  config={{ maxFiles: 1, acceptedTypes: ACCEPTED_IMAGE_TYPES }}
                />
                <p className="text-xs text-muted-foreground">
                  Recomendado: 1920x400px, formato JPG ou PNG
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-lg border bg-muted/30 p-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-1 rounded-full bg-primary" />
              <h3 className="text-base font-semibold">Endereço Comercial</h3>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <FormInput 
                  control={form.control} 
                  name="enderecoComercial.rua" 
                  label="Rua/Avenida"
                  placeholder="Ex: Rua da Missão"
                />
              </div>
              <FormInput 
                control={form.control} 
                name="enderecoComercial.numero" 
                label="Número"
                placeholder="123"
              />
              
              <FormInput 
                control={form.control} 
                name="enderecoComercial.bairro" 
                label="Bairro"
                placeholder="Ex: Maianga"
              />
              <FormInput 
                control={form.control} 
                name="enderecoComercial.cidade" 
                label="Cidade"
                placeholder="Ex: Luanda"
              />
              <FormInput 
                control={form.control} 
                name="enderecoComercial.estado" 
                label="Província"
                placeholder="Ex: Luanda"
              />
              
              <FormInput 
                control={form.control} 
                name="enderecoComercial.cep" 
                label="Código Postal"
                placeholder="Ex: 1234"
              />
              <div className="md:col-span-2">
                <FormInput 
                  control={form.control} 
                  name="enderecoComercial.complemento" 
                  label="Complemento"
                  placeholder="Ex: Edifício Atlântico, Loja 5"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Salvando...
                </>
              ) : (
                storeId ? 'Atualizar Loja' : 'Criar Loja'
              )}
            </Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}