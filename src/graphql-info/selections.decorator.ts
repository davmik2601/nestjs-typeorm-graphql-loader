// ***************************************************************************
// *       ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! !       *
// *                                                                         *
// *________________ this code and all helpers for this code ________________*
// *________ is written from  "@jenyus-org/nestjs-graphql-utils"  Lib _______*
// *                                                                         *
// ***************************************************************************

import {createParamDecorator, ExecutionContext} from '@nestjs/common';
import {GqlExecutionContext} from '@nestjs/graphql';
import {resolveSelections} from './resolve-selections';
import {FieldSelections} from './helpers';

export const Relations = (withParent = false) => {
  const fields: (string | FieldSelections)[] = ['**.**'];

  return createDecoratorFunction(fields, withParent);
};

export const SimpleFields = (withParent = false) => {
  const fields: (string | FieldSelections)[] = ['*.'];

  return createDecoratorFunction(fields, withParent);
};

export const Selections = (
  fields: (string | FieldSelections)[] = ['*.*'],
  withParent = false,
) => {
  return createDecoratorFunction(fields, withParent);
};

function createDecoratorFunction(
  fields?: (string | FieldSelections)[],
  withParent = false,
) {
  return createParamDecorator<{
    fields?: (string | FieldSelections)[];
    withParent: boolean;
  },
    ExecutionContext,
    string[]>(({fields, withParent}, context) => {
    const ctx = GqlExecutionContext.create(context);
    const info = ctx.getInfo();

    return resolveSelections(
      [
        {
          field: info.fieldName,
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
  })({fields, withParent});
}
