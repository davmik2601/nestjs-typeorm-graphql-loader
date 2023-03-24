import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { resolveSelections } from './resolve-selections';
import { FieldSelections } from './helpers';

export const Relations = () => {
  const fields: (string | FieldSelections)[] = ['**.**'];

  return createParamDecorator<
    {
      fields?: (string | FieldSelections)[];
      withParent: boolean;
    },
    ExecutionContext,
    string[]
  >(({ fields, withParent }, context) => {
    const ctx = GqlExecutionContext.create(context);
    const info = ctx.getInfo();

    return resolveSelections(
      [
        {
          field: info.fieldName, // fieldSelections,
          selections: withParent
            ? fields.map((f) =>
                typeof f === 'string'
                  ? {
                      field: f,
                      selector: [
                        ...info.fieldName.split('.'),
                        ...f.split('.'),
                      ].join('.'),
                    }
                  : f,
              )
            : fields,
        },
      ],
      info,
    );
  })({ fields, withParent: false });
};

// ***************************************************************************
// *       ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! !       *
// *                                                                         *
// *________________ this code and all helpers for this code ________________*
// *________ is written from  "@jenyus-org/nestjs-graphql-utils"  Lib _______*
// *                                                                         *
// ***************************************************************************

export const Selections = (
  fieldSelections: string | (string | FieldSelections)[],
  fields?: (string | FieldSelections)[],
  withParent = false,
) => {
  if (typeof fieldSelections === 'string' && !fields) {
    throw new TypeError(
      'Fields as a list of strings must be given if the parent field is specified as a string in the first argument.',
    );
  }

  return createParamDecorator<
    {
      fieldSelections: string | (string | FieldSelections)[];
      fields?: (string | FieldSelections)[];
      withParent: boolean;
    },
    ExecutionContext,
    string[]
  >(({ fieldSelections, fields, withParent }, context) => {
    const ctx = GqlExecutionContext.create(context);
    const info = ctx.getInfo();

    if (typeof fieldSelections === 'string') {
      return resolveSelections(
        [
          {
            field: fieldSelections,
            selections: withParent
              ? fields.map((f) =>
                  typeof f === 'string'
                    ? {
                        field: f,
                        selector: [
                          ...fieldSelections.split('.'),
                          ...f.split('.'),
                        ].join('.'),
                      }
                    : f,
                )
              : fields,
          },
        ],
        info,
      );
    } else {
      return resolveSelections(fieldSelections, info);
    }
  })({ fieldSelections, fields, withParent });
};
