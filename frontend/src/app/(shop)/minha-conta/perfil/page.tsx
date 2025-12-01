'use client';

import { useState } from 'react';
import { User, Mail, Phone, MapPin, Home, Building2, Edit2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

// 18 províncias de Angola (ordem oficial)
const provinciasAngola = [
  'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando Cubango', 'Cuanza Norte',
  'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla', 'Luanda', 'Lunda Norte',
  'Lunda Sul', 'Malanje', 'Moxico', 'Namibe', 'Uíge', 'Zaire'
];

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);

  // Dados fictícios (depois substituis por useUser ou contexto)
  const [formData, setFormData] = useState({
    nome: 'Maria José da Silva',
    email: 'maria.silva@email.ao',
    telefone: '944 123 456',
    provincia: 'Luanda',
    municipio: 'Talatona',
    bairro: 'Morro Bento',
    rua: 'Rua 25, Casa nº 87',
    referencia: 'Ao lado da Farmácia Popular',
  });

  const handleSave = () => {
    // Aqui farás a chamada à API depois
    toast.success('Dados atualizados com sucesso!');
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <User className="h-8 w-8 text-primary" />
          <h1 className="text-2xl lg:text-3xl font-bold">Os Meus Dados</h1>
        </div>

        <Button
          variant={isEditing ? "default" : "outline"}
          size="sm"
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="gap-2"
        >
          {isEditing ? (
            <>
              <Check className="h-4 w-4" />
              Guardar
            </>
          ) : (
            <>
              <Edit2 className="h-4 w-4" />
              Editar
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Coluna 1: Dados Pessoais */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações Pessoais
          </h2>

          <div className="space-y-4">
            <div>
              <Label>Nome completo</Label>
              <Input
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                E-mail
              </Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Telemóvel
              </Label>
              <Input
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                disabled={!isEditing}
                placeholder="9xx xxx xxx"
                className="mt-1"
              />
            </div>
          </div>
        </Card>

        {/* Coluna 2: Endereço de Entrega */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Endereço Principal
          </h2>

          <div className="space-y-4">
            <div>
              <Label>Província</Label>
              {isEditing ? (
                <Select
                  value={formData.provincia}
                  onValueChange={(v) => setFormData({ ...formData, provincia: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {provinciasAngola.map((prov) => (
                      <SelectItem key={prov} value={prov}>{prov}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="mt-1 text-foreground font-medium">{formData.provincia}</p>
              )}
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Município
              </Label>
              <Input
                value={formData.municipio}
                onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Bairro</Label>
              <Input
                value={formData.bairro}
                onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Rua / Avenida / Casa
              </Label>
              <Input
                value={formData.rua}
                onChange={(e) => setFormData({ ...formData, rua: e.target.value })}
                disabled={!isEditing}
                placeholder="Ex: Rua 25, Casa nº 87"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Ponto de referência (opcional)</Label>
              <Input
                value={formData.referencia}
                onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
                disabled={!isEditing}
                placeholder="Ex: Ao lado do supermercado Kero"
                className="mt-1"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Endereço completo (visualização quando não está editando) */}
      {!isEditing && (
        <Card className="p-6 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-3">
            <MapPin className="h-6 w-6 text-primary mt-1" />
            <div>
              <p className="font-semibold">Endereço de entrega principal</p>
              <p className="text-sm text-muted-foreground mt-1">
                {formData.rua}<br />
                {formData.bairro}, {formData.municipio}<br />
                {formData.provincia}, Angola<br />
                {formData.referencia && <span className="text-primary">({formData.referencia})</span>}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}