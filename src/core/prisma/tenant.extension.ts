import { ClsService } from 'nestjs-cls';
import { Prisma } from '../../generated/prisma/client';

// On passe le casier (cls) en paramètre pour que l'extension puisse le lire.
export const tenantExtension = (cls: ClsService) =>
  Prisma.defineExtension((client) =>
    client.$extends({
      query: {
        async $allOperations({ args, query }) {
          // TODO 1 : lire le tenantId dans le casier.
          //   Rappelle-toi : sans contexte, on veut voir ZÉRO ligne (sécurité).
          //   Quelle valeur par défaut donner si le casier est vide ?
          //   (indice : une chaîne vide '' → aucune ligne ne matchera le RLS)
          const tenantId = cls.get<string | undefined>('tenantId') ?? '';

          // La mini-transaction : set_config PUIS la vraie requête,
          // sur la même connexion. $transaction perd le typage précis du
          // tuple (set_config + query), on le réaffirme : on ignore le
          // premier résultat, le second est celui de la requête d'origine.
          const [, result] = (await client.$transaction([
            client.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`,

            // La requête d'origine, inchangée :
            query(args),
          ])) as [unknown, unknown];

          return result;
        },
      },
    }),
  );
