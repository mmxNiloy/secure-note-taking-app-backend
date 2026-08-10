import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { ApiSuccessDto } from '@/common/dto/api-response.dto';
import { PaginationMeta } from '@/common/dto/pagination.dto';

type SwaggerModel =
  Type<unknown> | (abstract new (...args: unknown[]) => unknown);

export function ApiSuccessResponse<TModel extends SwaggerModel>(model: TModel) {
  return applyDecorators(
    ApiExtraModels(ApiSuccessDto, model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiSuccessDto) },
          {
            properties: {
              data: { $ref: getSchemaPath(model) },
            },
          },
        ],
      },
    }),
  );
}

export function ApiSuccessResponseArray<TModel extends SwaggerModel>(
  model: TModel,
) {
  return applyDecorators(
    ApiExtraModels(ApiSuccessDto, model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiSuccessDto) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
    }),
  );
}

export function ApiSuccessResponsePaginated<TModel extends SwaggerModel>(
  model: TModel,
) {
  return applyDecorators(
    ApiExtraModels(ApiSuccessDto, PaginationMeta, model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiSuccessDto) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
              meta: { $ref: getSchemaPath(PaginationMeta) },
            },
          },
        ],
      },
    }),
  );
}
