import { formatZodError } from "@/utils/formatZodError.js";
import { CategoriaRepository } from "../repositories/categoria.repository.js";
import {  CreateCategoriaSchema, TCreateCategoriaInput, TUpdateCategoriaInput, updateCategoriaSchema } from "../schemas/categoria.schema.js";
import { NotFoundException, ValidationException } from "@/utils/domain.js";
import { TCategoriaResponse } from "../types/categoria.types.js";
import { IdMandatory } from "@/utils/IdMandatory.js";
import { NOTFOUND } from "@/utils/CONSTANTS.js";
import { validatePaginationParams } from "@/utils/validatePaginationParams.js";
import { IFAResponseService, TQueryRequest } from "@/types/query.types.js";

export class CategoriaService {
  constructor(private repository: CategoriaRepository){}

  async create(data: TCreateCategoriaInput): Promise<string>{
    const parseResult = CreateCategoriaSchema.safeParse(data)
    if(!parseResult.success){
      const errorMessage = formatZodError(parseResult.error)
      throw new ValidationException(errorMessage)
    }

    const result = await this.repository.create(parseResult.data)
    return result 
  }

  async createCategoriaFilho(data: TCreateCategoriaInput): Promise<string>{
    const parseResult = CreateCategoriaSchema.safeParse(data)
    if(!parseResult.success){
      const errorMessage = formatZodError(parseResult.error)
      throw new ValidationException(errorMessage)
    }
    if(!parseResult.data.categoriaPaiId){
      throw new ValidationException("Categoria Pai is Mandatory")
    }
    await this.findById(parseResult.data.categoriaPaiId)
    const result = await this.repository.create(parseResult.data)
    return result 
  }

  async findById(id: string): Promise<TCategoriaResponse | null>{
    await IdMandatory(id)
    const result = await this.repository.findById(id)
    if(!result){
      throw new NotFoundException(`${NOTFOUND("Categoria")}`)
    }
    return result 
  }


  async getAll({page, limit, search}: TQueryRequest):  Promise<IFAResponseService<TCategoriaResponse>> {
    validatePaginationParams(page, limit)
    
    const { data, total } = await this.repository.getAll({page, limit, search});
    return {
      data,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        total
      }
    };
  }

  async update(id: string, data: TUpdateCategoriaInput): Promise<TCategoriaResponse> {
    const validation = updateCategoriaSchema.safeParse(data);
    if (!validation.success) {
      const errorMessage = formatZodError(validation.error)
      throw new ValidationException(errorMessage)
    } 
    await this.findById(id); 
    return await this.repository.update(id, data);
  }
  
  async delete(id: string): Promise<boolean>{
    await this.findById(id)
    const result = await this.repository.delete(id)
    return result
  }
}