import type {
  FieldMiddleware,
  MiddlewareContext,
  NextFn,
} from '@nestjs/graphql';

import {DATA_LOADER_CONTEXT_KEY} from '../constants';
import {TYPEORM_DATALOADER_EXTENSION_FIELD} from '../constants';
import type {Context} from '../interfaces/context.interface';
import type {Extensions} from '../interfaces/extensions.interface';
import {
  handleOneToManyWithSelfKey,
  handleOneToOneNotOwnerWithSelfKey,
  handleToMany,
  handleToOne,
} from '../loader-handlers';
import {handleManyToMany} from '../loader-handlers/many-to-many.handler';

/**
 * This middleware checks and processes for the subfields of a parent entity that should be resolved by the data loader.
 * It will automatically parse the subfield with the given decorator according to the relation type given.
 */
export const TypeormLoaderMiddleware: FieldMiddleware = async (
  {context, info, source}: MiddlewareContext<any, Context>,
  next: NextFn,
) => {
  const extensions = info.parentType.getFields()[info.fieldName].extensions?.[
    TYPEORM_DATALOADER_EXTENSION_FIELD
    ] as Extensions['TYPEORM_DATALOADER_EXTENSION_FIELD'];

  const args = extensions?.args;

  if (!args) {
    return next();
  }

  if (context?.[DATA_LOADER_CONTEXT_KEY].typeormGetConnection == null) {
    throw new Error('Typeorm connection is not set.');
  }

  const extKey = extensions.key.toString();

  const relation = context[DATA_LOADER_CONTEXT_KEY].typeormGetConnection()
    .getMetadata(extensions.target.constructor)
    .findRelationWithPropertyPath(extKey);

  if (relation == null) {
    return next();
  }

  if (
    args?.options?.selfKey &&
    !(relation.isOneToMany || relation.isOneToOneNotOwner)
  ) {
    throw new Error(
      'selfKey option is available only for OneToMany or OneToOneNotOwner.',
    );
  }

  if (source[extKey]) {
    /*
      if my parent entity has extKey as selected (joined) filed.
      for example if parent is user from UserEntity, and our key is 'address',
      and if user.'address' exists (for example called with JOIN)
      returned already existed
    */
    return source[extKey];
  } else if (relation.isManyToOne || relation.isOneToOneOwner) {
    return handleToOne(args.keyFunc, source, context, info, relation);
  } else if (relation.isOneToMany) {
    return args?.options?.selfKey
      ? handleOneToManyWithSelfKey(
        args.keyFunc,
        source,
        context,
        info,
        relation,
        args.options,
      )
      : handleToMany(args.keyFunc, source, context, info, relation);
  } else if (relation.isOneToOneNotOwner) {
    return args?.options?.selfKey
      ? handleOneToOneNotOwnerWithSelfKey(
        args.keyFunc,
        source,
        context,
        info,
        relation,
        args.options,
      )
      : handleToOne(args.keyFunc, source, context, info, relation);
  } else if (relation.isManyToMany) {
    return handleManyToMany(args.keyFunc, source, context, info, relation);
  } else {
    return next();
  }
};
