'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { FormInput } from './form-input';
import { FormTextarea } from './form-textarea';
import { FormSelect, type FormOption } from './form-select';
import {
  FormCheckboxGroup,
  type CheckboxGroupOption
} from './form-checkbox-group';
import { FormRadioGroup, type RadioGroupOption } from './form-radio-group';
import { FormSwitch } from './form-switch';
import { FormSlider } from './form-slider';
import { FormDatePicker } from './form-date-picker';
import { FormCheckbox } from './form-checkbox';
import { FormFileUpload, type FileUploadConfig } from './form-file-upload';

// Demo form schema
const demoFormSchema = z.object({
  // Basic inputs
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  email: z.email('Endereço de e-mail inválido'),
  age: z.number().min(18, 'Deve ter pelo menos 18 anos de idade.'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.'),

  // Textarea
  bio: z.string().min(10, 'A biografia deve ter pelo menos 10 caracteres'),

  // Select
  country: z.string().min(1, 'Por favor, selecione um país'),

  // Checkbox group
  interests: z.array(z.string()).min(1, 'Selecione pelo menos um interesse'),

  // Radio group
  gender: z.string().min(1, 'Por favor, selecione um gênero'),

  // Switch
  newsletter: z.boolean(),

  // Slider
  rating: z.number().min(0).max(10),

  // Date picker
  birthDate: z.date().optional(),

  // Single checkbox
  terms: z.boolean().refine((val) => val === true, 'você deve aceitar os termos'),

  // File upload
  avatar: z.array(z.any()).optional()
});

type DemoFormData = z.infer<typeof demoFormSchema>;

// Demo options
const countryOptions: FormOption[] = [
  { value: 'aoa', label: 'Angola' },
  { value: 'pt', label: 'Portugal' },
  { value: 'br', label: 'Brasil' },
  
];

const interestOptions: CheckboxGroupOption[] = [
  { value: 'technology', label: 'Tecnologias' },
  { value: 'sports', label: 'Desporto' },
  { value: 'music', label: 'Musica' },
  { value: 'travel', label: 'Viagens' },
  { value: 'cooking', label: 'Cozinha' },
  { value: 'reading', label: 'Leitura' }
];

const genderOptions: RadioGroupOption[] = [
  { value: 'male', label: 'Homem' },
  { value: 'female', label: 'Mulher' },
 
];

const fileUploadConfig: FileUploadConfig = {
  maxSize: 5000000, // 5MB
  acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  multiple: false,
  maxFiles: 1
};

export default function DemoForm() {
  const form = useForm<DemoFormData>({
    resolver: zodResolver(demoFormSchema),
    defaultValues: {
      name: '',
      email: '',
      age: 18,
      password: '',
      bio: '',
      country: '',
      interests: [],
      gender: '',
      newsletter: false,
      rating: 5,
      birthDate: undefined,
      terms: false,
      avatar: []
    }
  });

  const onSubmit = () => {
    // console.log('Form submitted:', data);
    alert('Formulário enviado com sucesso! Verifique o console para obter os dados.');
  };

  return (
    <div className='mx-auto max-w-2xl space-y-6 p-6'>
      <Card>
        <CardHeader>
          <CardTitle className='text-2xl font-bold'>
            Demonstração de componentes de formulário reutilizáveis
          </CardTitle>
          <p className='text-muted-foreground'>
            Veja como esses componentes reduzem o texto repetitivo de mais de 15 linhas para apenas
5 a 8 linhas por campo
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            {/* Basic Inputs */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <FormInput
                control={form.control}
                name='name'
                label='Nome completo'
                placeholder='Digite seu nome completo'
                required
              />

              <FormInput
                control={form.control}
                name='email'
                type='email'
                label='E-mail'
                placeholder='Digite seu endereço de e-mail'
                required
              />

              <FormInput
                control={form.control}
                name='age'
                type='number'
                label='Idade'
                min={18}
                max={100}
                required
              />

              <FormInput
                control={form.control}
                name='password'
                type='password'
                label='Palavra-passe'
                placeholder='Digite sua palavra-passe'
                required
              />
            </div>

            {/* Textarea */}
            <FormTextarea
              control={form.control}
              name='bio'
              label='Bio'
              placeholder='Fale nos sobre ti...'
              description='Uma breve biografia sobre você (mínimo 10 caracteres)'
              config={{
                maxLength: 500,
                showCharCount: true,
                rows: 4
              }}
              required
            />

            {/* Select */}
            <FormSelect
              control={form.control}
              name='country'
              label='Pais'
              placeholder='Selecione o seu país'
              options={countryOptions}
              required
            />

            {/* Checkbox Group */}
            <FormCheckboxGroup
              control={form.control}
              name='interests'
              label='Interesses'
              description='Selecione os seus interesses'
              options={interestOptions}
              columns={3}
              showBadges={true}
              required
            />

            {/* Radio Group */}
            <FormRadioGroup
              control={form.control}
              name='gender'
              label='Genero'
              options={genderOptions}
              orientation='horizontal'
              required
            />

            {/* Switch */}
            <FormSwitch
              control={form.control}
              name='newsletter'
              label='Subscrever à Newsletter'
              description='Receber atualizações e novidades por e-mail'
            />

            {/* Slider */}
            <FormSlider
              control={form.control}
              name='rating'
              label='Avaliação'
              description='Avalie a sua experiência (0-10)'
              config={{
                min: 0,
                max: 10,
                step: 0.5,
                formatValue: (value) => `${value}/10`
              }}
              showValue={true}
            />

            {/* Date Picker */}
            <FormDatePicker
              control={form.control}
              name='birthDate'
              label='Data de Nascimento'
              description='Data de Nascimento (opcional)'
              config={{
                maxDate: new Date(),
                placeholder: 'Selecione a sua data de nascimento'
              }}
            />

            {/* Single Checkbox */}
            <FormCheckbox
              control={form.control}
              name='terms'
              checkboxLabel='Eu aceito os termos e condições'
              description='Por favor, aceite os termos e condições para continuar.'
              required
            />

            {/* File Upload */}
            <FormFileUpload
              control={form.control}
              name='avatar'
              label='Foto de Perfil'
              description='Carregue uma foto de perfil (opcional)'
              config={fileUploadConfig}
            />

            {/* Submit Button */}
            <div className='flex gap-4 pt-4'>
              <Button type='submit' className='flex-1'>
                Enviar Formulário
              </Button>
              <Button
                type='button'
                variant='outline'
                onClick={() => form.reset()}
                className='flex-1'
              >
                Redefinir Formulário
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Form Data Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Pré-visualização do formulário de dados</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className='bg-muted overflow-auto rounded-lg p-4 text-sm'>
            {JSON.stringify(form.watch(), null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
