import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { ApiSuccess } from 'src/utils/api-response.dto';

type SwaggerModel = Type<any> | (abstract new (...args: any[]) => any);

export function ApiSuccessResponse<TModel extends SwaggerModel>(model: TModel) {
  return applyDecorators(
    ApiExtraModels(ApiSuccess, model),
    ApiOkResponse({
      schema: {
        allOf: [
          {
            $ref: getSchemaPath(ApiSuccess),
          },
          {
            properties: {
              data: {
                $ref: getSchemaPath(model),
              },
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
    ApiExtraModels(ApiSuccess, model),
    ApiOkResponse({
      schema: {
        allOf: [
          {
            $ref: getSchemaPath(ApiSuccess),
          },
          {
            properties: {
              data: {
                type: 'array',
                items: {
                  $ref: getSchemaPath(model),
                },
              },
            },
          },
        ],
      },
    }),
  );
}
