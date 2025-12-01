'use client';

import { FormFileUpload } from '@/components/forms/form-file-upload';
import { FormInput } from '@/components/forms/form-input';
import { FormSelect } from '@/components/forms/form-select';
import { FormTextarea } from '@/components/forms/form-textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useGetCategories, useCreateProduct } from '@/lib/queries/product';
import { useState } from 'react';
import { useGetLojas } from '@/lib/queries/useLoja';

const MAX_FILE_SIZE = 5 * 1024 * 1024; 
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const formSchema = z.object({
  images: z
    .array(
      z
        .instanceof(File)
        .refine((file) => file.size <= MAX_FILE_SIZE, `O tamanho máximo do arquivo é 5MB.`)
        .refine(
          (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
          'Apenas arquivos .jpg, .jpeg, .png e .webp são aceitos.'
        )
    )
    .min(1, 'Pelo menos uma imagem é obrigatória.')
    .max(4, 'No máximo 4 imagens são permitidas.'),
  titulo: z.string().min(2, {
    message: 'O nome do produto deve ter pelo menos 2 caracteres.',
  }),
  categoriaId: z.string().uuid('Selecione uma categoria válida.').optional(),
  preco: z.coerce.number().min(0, {
    message: 'O preço deve ser um valor positivo.',
  }),
  descricao: z.string().min(10, {
    message: 'A descrição deve ter pelo menos 10 caracteres.',
  }),
  lojaId: z.string().uuid('Loja inválida.'),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  condicao: z.enum(['novo_com_etiqueta', 'novo_sem_etiqueta', 'aceitavel', 'usado']).default('novo_com_etiqueta'),
  quantidadeEstoque: z.coerce.number().int().min(0).default(0),
  quantidadeMinima: z.coerce.number().int().min(1).default(1),
  permitePedidoSemEstoque: z.boolean().default(false),
  sku: z.string().optional(),
  codigoBarras: z.string().optional(),
  pesoKg: z.coerce.number().optional(),
  alturaCm: z.coerce.number().optional(),
  larguraCm: z.coerce.number().optional(),
  ativo: z.boolean().default(true),
  
  tamanho: z.string().optional(),
  cor: z.string().optional(),
  material: z.string().optional(),
  genero: z.enum(['women', 'men', 'kids', 'unisex']).optional(),
  idadeGrupo: z.enum(['adult', 'kids', 'baby']).optional(),
  
  tags: z.string().optional(),
  atributos: z.string().optional(), 
});

type FormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  initialData?: Partial<FormValues> | null;
  pageTitle: string;
}

export default function ProductForm({ initialData, pageTitle }: ProductFormProps) {
  const router = useRouter();
  const { data: categories, isLoading: isCategoriesLoading } = useGetCategories();
  const { data: dataLoja, isLoading: isLoadingLoja } = useGetLojas(1, 1)
  const { mutate: createProduct, isPending: isSubmitting } = useCreateProduct();
  const [isLoading, setIsLoading] = useState(false);

  const defaultValues: Partial<FormValues> = {
    images: [],
    titulo: initialData?.titulo || '',
    categoriaId: initialData?.categoriaId || undefined,
    preco: initialData?.preco || undefined,
    descricao: initialData?.descricao || '',
    lojaId: dataLoja?.data?.[0]?.id || "019a0c76-c744-781b-9aa4-33cb80ff40ec", 
    marca: initialData?.marca,
    modelo: initialData?.modelo,
    condicao: initialData?.condicao || 'novo_com_etiqueta',
    quantidadeEstoque: initialData?.quantidadeEstoque || 0,
    quantidadeMinima: initialData?.quantidadeMinima || 1,
    permitePedidoSemEstoque: initialData?.permitePedidoSemEstoque || false,
    sku: initialData?.sku,
    codigoBarras: initialData?.codigoBarras,
    pesoKg: initialData?.pesoKg,
    alturaCm: initialData?.alturaCm,
    larguraCm: initialData?.larguraCm,
    ativo: initialData?.ativo ?? true,
    tamanho: initialData?.tamanho,
    cor: initialData?.cor,
    material: initialData?.material,
    genero: initialData?.genero,
    idadeGrupo: initialData?.idadeGrupo,
    tags: initialData?.tags,
    atributos: initialData?.atributos,
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    const formData = new FormData();

    values.images.forEach((file, index) => {
      formData.append(`images[${index}]`, file);
    });
    if (values.tags) {
      const tagsArray = values.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      formData.append('tags', JSON.stringify(tagsArray));
    }

    if (values.atributos) {
      try {
        const atributosObj = JSON.parse(values.atributos);
        formData.append('atributos', JSON.stringify(atributosObj));
      } catch (e) {
      }
    }

    Object.entries(values).forEach(([key, value]) => {
      if (key !== 'images' && key !== 'tags' && key !== 'atributos') {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value.toString());
        }
      }
    });

    createProduct(formData, {
      onSuccess: () => {
        router.push('/dashboard/product');
      },
      onSettled: () => {
        setIsLoading(false);
      },
    });
  }

  if (isCategoriesLoading || isLoadingLoja) {
    return <div>Carregando...</div>;
  }

  return (
    <Card className="mx-auto w-full">
      <CardHeader>
        <CardTitle className="text-left text-2xl font-bold">{pageTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormFileUpload
            control={form.control}
            name="images"
            label="Imagens do Produto"
            description="Faça upload de até 4 imagens do produto"
            config={{
              maxSize: MAX_FILE_SIZE,
              maxFiles: 4,
              multiple: true,
              acceptedTypes: ACCEPTED_IMAGE_TYPES,
            }}
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormInput
              control={form.control}
              name="titulo"
              label="Nome do Produto"
              placeholder="Digite o nome do produto"
              required
            />

            <FormSelect
              control={form.control}
              name="categoriaId"
              label="Categoria"
              placeholder="Selecione a categoria"
              options={
                categories?.map((category) => ({
                  label: category.nome,
                  value: category.id,
                })) || []
              }
            />

            <FormInput
              control={form.control}
              name="preco"
              label="Preço"
              placeholder="Digite o preço"
              required
              type="number"
              min={0}
              step="0.01"
            />

            <FormInput
              control={form.control}
              name="quantidadeEstoque"
              label="Quantidade em Estoque"
              placeholder="Digite a quantidade"
              required
              type="number"
              min={0}
              step="1"
            />

            <FormSelect
              control={form.control}
              name="condicao"
              label="Condição"
              placeholder="Selecione a condição"
              required
              options={[
                { label: 'Novo com Etiqueta', value: 'novo_com_etiqueta' },
                { label: 'Novo sem Etiqueta', value: 'novo_sem_etiqueta' },
                { label: 'Aceitável', value: 'aceitavel' },
                { label: 'Usado', value: 'usado' },
              ]}
            />

            <FormInput
              control={form.control}
              name="marca"
              label="Marca"
              placeholder="Digite a marca (opcional)"
            />

            <FormInput
              control={form.control}
              name="modelo"
              label="Modelo"
              placeholder="Digite o modelo (opcional)"
            />

            <FormInput
              control={form.control}
              name="tamanho"
              label="Tamanho"
              placeholder="Ex: XS, S, M, L, XL"
            />

            <FormInput
              control={form.control}
              name="cor"
              label="Cor"
              placeholder="Ex: black, white, blue"
            />

            <FormInput
              control={form.control}
              name="material"
              label="Material"
              placeholder="Ex: cotton, leather, polyester"
            />

            <FormSelect
              control={form.control}
              name="genero"
              label="Gênero"
              placeholder="Selecione o gênero"
              options={[
                { label: 'Mulheres', value: 'women' },
                { label: 'Homens', value: 'men' },
                { label: 'Crianças', value: 'kids' },
                { label: 'Unissex', value: 'unisex' },
              ]}
            />

            <FormSelect
              control={form.control}
              name="idadeGrupo"
              label="Grupo de Idade"
              placeholder="Selecione o grupo"
              options={[
                { label: 'Adulto', value: 'adult' },
                { label: 'Crianças', value: 'kids' },
                { label: 'Bebê', value: 'baby' },
              ]}
            />

            <FormInput
              control={form.control}
              name="sku"
              label="SKU"
              placeholder="Digite o SKU (opcional)"
            />

            <FormInput
              control={form.control}
              name="codigoBarras"
              label="Código de Barras"
              placeholder="Digite o código de barras (opcional)"
            />

            <FormInput
              control={form.control}
              name="pesoKg"
              label="Peso (kg)"
              placeholder="Digite o peso (opcional)"
              type="number"
              min={0}
              step="0.01"
            />

            <FormInput
              control={form.control}
              name="alturaCm"
              label="Altura (cm)"
              placeholder="Digite a altura (opcional)"
              type="number"
              min={0}
              step="0.01"
            />

            <FormInput
              control={form.control}
              name="larguraCm"
              label="Largura (cm)"
              placeholder="Digite a largura (opcional)"
              type="number"
              min={0}
              step="0.01"
            />
          </div>

          <FormTextarea
            control={form.control}
            name="descricao"
            label="Descrição"
            placeholder="Digite a descrição do produto"
            required
            config={{
              maxLength: 500,
              showCharCount: true,
              rows: 4,
            }}
          />

          <FormInput
            control={form.control}
            name="tags"
            label="Tags"
            placeholder="Ex: verão, casual, promoção (separadas por vírgula)"
          />

          <FormTextarea
            control={form.control}
            name="atributos"
            label="Atributos (JSON)"
            placeholder='Ex: {"water_resistant": true, "breathable": false}'
            config={{
              rows: 3,
            }}
          />

          <Button type="submit" disabled={isSubmitting || isLoading}>
            {isSubmitting || isLoading ? 'Enviando...' : 'Adicionar Produto'}
          </Button>
        </Form>
      </CardContent>
    </Card>
  );
}