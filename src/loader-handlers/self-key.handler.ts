import type { RelationMetadata } from 'typeorm/metadata/RelationMetadata';

import { handler } from './callback-handler.handler';
import type { Context } from '../interfaces/context.interface';
import type { SelfKeyFunc } from '../interfaces/typeorm-loader-handler.interface';
import { SelfKeyDataloader } from '../loaders';
import { GraphQLResolveInfo } from 'graphql';
import {TypeormLoaderOptions} from "../interfaces/typeorm-loader.interface";

export async function handleOneToOneNotOwnerWithSelfKey<V>(
  selfKeyFunc: SelfKeyFunc,
  parent: any,
  context: Context,
  info: GraphQLResolveInfo,
  relation: RelationMetadata,
  options?: TypeormLoaderOptions,
): Promise<any> {
  return handler(
    context,
    relation,
    relation.entityMetadata.primaryColumns,
    (connection): any =>
      new SelfKeyDataloader<V>(info, relation, connection, selfKeyFunc, options),
    async (dataloader, columns) => {
      return (
        (await dataloader.load(columns[0].getEntityValue(parent)))[0] ?? null
      );
    },
  );
}

export async function handleOneToManyWithSelfKey<V>(
  selfKeyFunc: SelfKeyFunc,
  parent: any,
  context: Context,
  info: GraphQLResolveInfo,
  relation: RelationMetadata,
  options?: TypeormLoaderOptions,
): Promise<any> {
  return handler(
    context,
    relation,
    relation.entityMetadata.primaryColumns,
    (connection): any =>
      new SelfKeyDataloader<V>(info, relation, connection, selfKeyFunc, options),
    async (dataloader, columns) => {
      return dataloader.load(columns[0].getEntityValue(parent));
    },
  );
}
