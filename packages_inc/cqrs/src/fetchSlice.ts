import {} from "@morphic-ts/batteries/lib/summoner-ESBAST";
import { T, NEA, pipe } from "@matechs/prelude";
import { DbT } from "@matechs/orm";
import { accessConfig } from "./config";
import { ElemType } from "@morphic-ts/adt/lib/utils";
import * as t from "io-ts";
import { ProgramURI } from "@morphic-ts/batteries/lib/usage/ProgramType";
import { InterpreterURI } from "@morphic-ts/batteries/lib/usage/InterpreterResult";
import { AOfTypes, MorphADT } from "@morphic-ts/batteries/lib/usage/tagged-union";

// experimental alpha
/* istanbul ignore file */

export class SliceFetcher<
  Types extends {
    [k in keyof Types]: [any, any];
  },
  Tag extends string,
  ProgURI extends ProgramURI,
  InterpURI extends InterpreterURI,
  Keys extends NEA.NonEmptyArray<keyof Types>,
  Db extends symbol | string,
  Env
> {
  private readonly inDomain: (
    a: AOfTypes<Types>
  ) => a is AOfTypes<{ [k in Extract<keyof Types, ElemType<Keys>>]: Types[k] }>;

  constructor(
    private readonly S: MorphADT<Types, Tag, ProgURI, InterpURI, Env>,
    private readonly eventTypes: Keys,
    private readonly db: DbT<Db>
  ) {
    const nS = S.select(eventTypes);

    this.inDomain = (a): a is AOfTypes<{ [k in Extract<keyof Types, ElemType<Keys>>]: Types[k] }> =>
      typeof nS.keys[a[S.tag]] !== "undefined" ? true : false;
  }

  fetchSlice(aggregate: string) {
    return pipe(
      accessConfig,
      T.chain(({ id, limit }) =>
        pipe(
          pipe(
            T.pure(
              `SELECT id, kind, event, sequence, aggregate, root, created_at FROM event_log WHERE aggregate = '${aggregate}' AND kind IN(${this.eventTypes
                .map((e) => `'${e}'`)
                .join(
                  ","
                )}) AND offsets->>'${id}' IS NULL ORDER BY created_at ASC, sequence ASC LIMIT ${limit};`
            ),
            T.chain((query) => this.db.withManagerTask((manager) => () => manager.query(query)))
          )
        )
      ),
      T.map(
        (
          x: Array<{
            id: string;
            kind: string;
            event: unknown;
            aggregate: string;
            root: string;
            sequence: string;
            created_at: string;
          }>
        ) => x.map((e) => e)
      ),
      T.chain(
        T.traverseArray(({ id, event, kind, aggregate, root, sequence, created_at }) =>
          T.sequenceS({
            id: T.pure(id),
            aggregate: T.pure(aggregate),
            root: T.pure(root),
            sequence: T.pure(BigInt(sequence)),
            kind: T.pure(kind),
            createdAt: T.pure(created_at),
            event: T.orAbort(
              pipe(
                this.S.keys[kind]
                  ? T.fromEither(this.S.type.decode(event))
                  : T.raiseError<Error | t.Errors, AOfTypes<Types>>(new Error("unknown event")),
                T.chain((a) =>
                  this.inDomain(a)
                    ? T.pure(a)
                    : T.raiseError(new Error("decoded event is out of bounds"))
                )
              )
            )
          })
        )
      )
    );
  }
}

export class AggregateFetcher<
  Types extends {
    [k in keyof Types]: [any, any];
  },
  Tag extends string,
  ProgURI extends ProgramURI,
  InterpURI extends InterpreterURI,
  Keys extends NEA.NonEmptyArray<keyof Types>,
  Db extends symbol | string,
  Env
> {
  private readonly inDomain: (
    a: AOfTypes<Types>
  ) => a is AOfTypes<{ [k in Extract<keyof Types, ElemType<Keys>>]: Types[k] }>;

  constructor(
    private readonly S: MorphADT<Types, Tag, ProgURI, InterpURI, Env>,
    eventTypes: Keys,
    private readonly db: DbT<Db>
  ) {
    const nS = S.select(eventTypes);

    this.inDomain = (a): a is AOfTypes<{ [k in Extract<keyof Types, ElemType<Keys>>]: Types[k] }> =>
      typeof nS.keys[a[S.tag]] !== "undefined" ? true : false;
  }

  fetchSlice(aggregate: string) {
    return pipe(
      accessConfig,
      T.chain(({ id, limit }) =>
        pipe(
          pipe(
            T.pure(
              `SELECT id, kind, event, sequence, aggregate, root, created_at FROM event_log WHERE aggregate = '${aggregate}' AND offsets->>'${id}' IS NULL ORDER BY created_at ASC, sequence ASC LIMIT ${limit};`
            ),
            T.chain((query) => this.db.withManagerTask((manager) => () => manager.query(query)))
          )
        )
      ),
      T.map(
        (
          x: Array<{
            id: string;
            kind: string;
            event: unknown;
            aggregate: string;
            root: string;
            sequence: string;
            created_at: string;
          }>
        ) => x.map((e) => e)
      ),
      T.chain(
        T.traverseArray(({ id, event, kind, sequence, root, aggregate, created_at }) =>
          T.sequenceS({
            id: T.pure(id),
            aggregate: T.pure(aggregate),
            root: T.pure(root),
            sequence: T.pure(BigInt(sequence)),
            kind: T.pure(kind),
            createdAt: T.pure(created_at),
            event: T.orAbort(
              pipe(
                this.S.keys[kind]
                  ? T.fromEither(this.S.type.decode(event))
                  : T.raiseError<Error | t.Errors, AOfTypes<Types>>(new Error("unknown event")),
                T.chain((a) =>
                  this.inDomain(a)
                    ? T.pure(a)
                    : T.raiseError(new Error("decoded event is out of bounds"))
                )
              )
            )
          })
        )
      )
    );
  }
}

export class DomainFetcher<
  Types extends {
    [k in keyof Types]: [any, any];
  },
  Tag extends string,
  ProgURI extends ProgramURI,
  InterpURI extends InterpreterURI,
  Keys extends NEA.NonEmptyArray<keyof Types>,
  Db extends symbol | string,
  Env
> {
  private readonly inDomain: (
    a: AOfTypes<Types>
  ) => a is AOfTypes<{ [k in Extract<keyof Types, ElemType<Keys>>]: Types[k] }>;

  constructor(
    private readonly S: MorphADT<Types, Tag, ProgURI, InterpURI, Env>,
    private readonly eventTypes: Keys,
    private readonly db: DbT<Db>
  ) {
    const nS = S.select(eventTypes);

    this.inDomain = (a): a is AOfTypes<{ [k in Extract<keyof Types, ElemType<Keys>>]: Types[k] }> =>
      typeof nS.keys[a[S.tag]] !== "undefined" ? true : false;
  }

  fetchSlice() {
    return pipe(
      accessConfig,
      T.chain(({ id, limit }) =>
        pipe(
          pipe(
            T.pure(
              `SELECT id, kind, event, sequence, aggregate, root, created_at FROM event_log WHERE kind IN(${this.eventTypes
                .map((e) => `'${e}'`)
                .join(
                  ","
                )}) AND offsets->>'${id}' IS NULL ORDER BY created_at ASC, sequence ASC LIMIT ${limit};`
            ),
            T.chain((query) => this.db.withManagerTask((manager) => () => manager.query(query)))
          )
        )
      ),
      T.map(
        (
          x: Array<{
            id: string;
            kind: string;
            event: unknown;
            aggregate: string;
            root: string;
            sequence: string;
            created_at: string;
          }>
        ) => x.map((e) => e)
      ),
      T.chain(
        T.traverseArray(({ id, event, kind, aggregate, root, sequence, created_at }) =>
          T.sequenceS({
            id: T.pure(id),
            aggregate: T.pure(aggregate),
            root: T.pure(root),
            sequence: T.pure(BigInt(sequence)),
            kind: T.pure(kind),
            createdAt: T.pure(created_at),
            event: T.orAbort(
              pipe(
                this.S.keys[kind]
                  ? T.fromEither(this.S.type.decode(event))
                  : T.raiseError<Error | t.Errors, AOfTypes<Types>>(new Error("unknown event")),
                T.chain((a) =>
                  this.inDomain(a)
                    ? T.pure(a)
                    : T.raiseError(new Error("decoded event is out of bounds"))
                )
              )
            )
          })
        )
      )
    );
  }
}

export class DomainFetcherAll<
  Types extends {
    [k in keyof Types]: [any, any];
  },
  Tag extends string,
  ProgURI extends ProgramURI,
  InterpURI extends InterpreterURI,
  Db extends symbol | string,
  Env
> {
  constructor(
    private readonly S: MorphADT<Types, Tag, ProgURI, InterpURI, Env>,
    private readonly db: DbT<Db>
  ) {}

  fetchSlice() {
    return pipe(
      accessConfig,
      T.chain(({ id, limit }) =>
        pipe(
          T.pure(
            `SELECT id, kind, event, sequence, aggregate, root, created_at FROM event_log WHERE offsets->>'${id}' IS NULL ORDER BY created_at ASC, sequence ASC LIMIT ${limit};`
          ),
          T.chain((query) => this.db.withManagerTask((manager) => () => manager.query(query)))
        )
      ),
      T.map(
        (
          x: Array<{
            id: string;
            event: unknown;
            kind: string;
            aggregate: string;
            root: string;
            sequence: string;
            created_at: string;
          }>
        ) => x.map((e) => e)
      ),
      T.chain(
        T.traverseArray(({ id, event, sequence, root, aggregate, kind, created_at }) =>
          T.sequenceS({
            id: T.pure(id),
            aggregate: T.pure(aggregate),
            root: T.pure(root),
            kind: T.pure(kind),
            createdAt: T.pure(created_at),
            sequence: T.pure(BigInt(sequence)),
            event: T.orAbort(T.fromEither(this.S.type.decode(event)))
          })
        )
      )
    );
  }
}
