import { FastifyReply, FastifyRequest } from "fastify";
import { ProdutoService } from "../services/produto.service.js";
import { TCreateProdutoInput, TUpdateProdutoInput } from "../schemas/produto.schema.js";
import { TIdParam, TQueryRequest } from "@/types/query.types.js";
import { BadRequestException, ConflictException, UnauthorizedException } from "@/utils/domain.js";
import { logError } from "@/utils/logger.js";
import { ImageUploadService } from "../utils/imageUploadService.js";
import { CONDICAOPRODUTO } from "../types/produto.types.js";
import { TFilterParams } from "../repositories/produto.repository.js";

type MultipartProductBody = Omit<TCreateProdutoInput, 'images' | 'preco' | 'precoOriginal' | 'quantidadeEstoque' | 'ativo' | 'permitePedidoSemEstoque'> & {
  preco: string;
  precoOriginal?: string;
  quantidadeEstoque: string;
  ativo?: string;
  permitePedidoSemEstoque?: string;
};


export class ProdutoController {
  constructor(private service: ProdutoService) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.userId;
    if (!userId) {
      throw new UnauthorizedException("Rota não autenticada");
    }
    try {
      if (!request.isMultipart()) {
        return reply
          .code(400)
          .send(new BadRequestException('A requisição deve ser do tipo multipart/form-data.'));
      }

      const allParts: Array<{ type: 'file' | 'field'; data: any }> = [];
      const parts = request.parts();

      try {
        for await (const part of parts) {
          if (part.type === 'file') {
            const buffer = await part.toBuffer();
            allParts.push({
              type: 'file',
              data: {
                fieldname: part.fieldname,
                filename: part.filename,
                encoding: part.encoding,
                mimetype: part.mimetype,
                buffer: buffer,
              },
            });
          } else {
            allParts.push({
              type: 'field',
              data: {
                fieldname: part.fieldname,
                value: part.value,
              },
            });
          }
        }
      } catch (error: unknown) {
        logError(error instanceof Error ? error : new Error(String(error)), { controller: 'ProdutoController.create', stage: 'collectParts' });
        throw error;
      }

      const files: Array<{
        fieldname: string;
        filename: string;
        encoding: string;
        mimetype: string;
        buffer: Buffer;
      }> = [];

      const body: Partial<MultipartProductBody> = {};

      for (const part of allParts) {
        if (part.type === 'file') {
          files.push(part.data);
        } else {
          const fieldName = part.data.fieldname as keyof MultipartProductBody;
          body[fieldName] = part.data.value as any;
        }
      }

      if (files.length === 0) {
        throw new BadRequestException('Pelo menos uma imagem é obrigatória.', 'ProdutoController');
      }

      const uploadedImagesInfo = await ImageUploadService.uploadMultipleFromBuffer(files);

      const productData: TCreateProdutoInput = {
        lojaId: body.lojaId!,
        titulo: body.titulo!,
        descricao: body.descricao!,
        categoriaId: body.categoriaId,
        preco: Number(body.preco),
        marca: body.marca,
        modelo: body.modelo,
        condicao: body.condicao ?? CONDICAOPRODUTO.NOVO_COM_ETIQUETA,
        quantidadeEstoque: Number(body.quantidadeEstoque),
        quantidadeMinima: body.quantidadeMinima ? Number(body.quantidadeMinima) : 1,
        permitePedidoSemEstoque: body.permitePedidoSemEstoque === 'true',
        sku: body.sku,
        codigoBarras: body.codigoBarras,
        pesoKg: body.pesoKg ? Number(body.pesoKg) : undefined,
        alturaCm: body.alturaCm ? Number(body.alturaCm) : undefined,
        larguraCm: body.larguraCm ? Number(body.larguraCm) : undefined,
        ativo: body.ativo === 'true',
        images: uploadedImagesInfo.map((img, index) => ({
          url: img.url,
          altText: img.altText,
          position: index + 1,
          isPrincipal: index === 0,
        })),
      };

      const productId = await this.service.create(productData, userId);

      return reply.code(201).send({
        status: 'success',
        message: 'Produto criado com sucesso',
        data: productId,
      });
    } catch (error: Error | string | unknown) {
      logError(error instanceof Error ? error : new Error(String(error)), { controller: 'ProdutoController.create' });

      if (error instanceof BadRequestException || error instanceof ConflictException) {
        return reply.code(400).send(error);
      }

      return reply.code(500).send({
        status: 'error',
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  }

  
  async findByLoja(
    request: FastifyRequest<{ Params: TIdParam }>,
    reply: FastifyReply
  ) {
    const result = await this.service.findByLoja(request.params.id);
    return reply.code(200).send({
      status: "success",
      data: result,
    });
  }

  async findById(
    request: FastifyRequest<{ Params: TIdParam }>,
    reply: FastifyReply
  ) {
    const result = await this.service.findById(request.params.id);
    return reply.code(200).send({
      status: "success",
      data: result,
    });
  }

  async getAll(
    request: FastifyRequest<{
      Querystring: TQueryRequest & {
        categories?: string;
        brands?: string;
        colors?: string;
        sizes?: string;
        conditions?: string;
        priceMin?: string;
        priceMax?: string;
        sortBy?: string;
        inStock?: string;
      }
    }>,
    reply: FastifyReply
  ) {

    const { page, limit, search, categories, brands, colors, sizes, conditions, priceMin, priceMax, sortBy, inStock } = request.query;

    const filters: TFilterParams = {};
    if (categories) filters.categories = categories.split(',');
    if (brands) filters.brands = brands.split(',');
    if (colors) filters.colors = colors.split(',');
    if (sizes) filters.sizes = sizes.split(',');
    if (conditions) filters.conditions = conditions.split(',');
    if (priceMin && priceMax) {
      filters.price = { min: Number(priceMin), max: Number(priceMax) };
    }
    if (sortBy) filters.sortBy = sortBy;
    if (inStock) filters.inStock = inStock === 'true';

    const result = await this.service.getAll({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      search,
      filters,
    });

    return reply.code(200).send({
      status: "success",
      ...result,
    });
  }

  async getFilterOptions(_request: FastifyRequest, reply: FastifyReply) {
    const options = await this.service.getFilterOptions();
    return reply.code(200).send({
      status: 'success',
      data: options,
    });
  }


  async update(
    request: FastifyRequest<{ Params: { id: string }; Body: TUpdateProdutoInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.userId;
    if (!userId) {
      throw new UnauthorizedException("Rota não autenticada");
    }
    const updated = await this.service.update(request.params.id, request.body, userId);
    return reply.code(200).send({
      status: "success",
      message: "Produto atualizado com sucesso",
      data: updated,
    });
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.userId;
    if (!userId) {
      throw new UnauthorizedException("Rota não autenticada");
    }
    await this.service.delete(request.params.id, userId);
    return reply.code(204).send({});
  }
}
