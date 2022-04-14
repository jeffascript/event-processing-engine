// An Event processing Engine using generics and mapped types

// define the class structure for the event processor

type MapReturnType<T> = (data: T) => T;

type FilterReturnType<T> = (data: T) => boolean;

//generic handler type
type Handler<T> = {
  [Property in keyof T as `map${Capitalize<string & Property>}`]?: MapReturnType<T[Property]>;
} & {
  [Property in keyof T as `filter${Capitalize<string & Property>}`]?: FilterReturnType<T[Property]>;
};

class EventProcessor<T extends Record<string, unknown>> {
  private handlers: Handler<T>[] = [];

  addHandler(handler: Handler<T>) {
    this.handlers.push(handler);
  }
}

/* 
Sample handler: 1. 
EventProcessorClass.addHandler({
    filterLogin: ({ user }) => Boolean(user),
    mapLogin: (data) => ({
      ...data,
      hasSession: Boolean(data.user && data.name),
    }),
  })

  Result:
  [
    {
      eventName: 'addListing',
      data: { user: 'tom', name: 'tomas', hasAccess: true }
    },
    { eventName: 'removeFromListing', data: { user: 'tom' } }
  ]


 Sample handler: 2.

  EventProcessorClass.addHandler({
    filterLogin: ({ user }) => Boolean(user),
    mapLogin: (data) => ({
      ...data,
      hasSession: Boolean(data.user && data.name),
    }),
  });

 Result:
  [
    {
      eventName: 'login',
      data: { user: 'tom', name: 'tomas', hasSession: true }
    },
    { eventName: 'logout', data: { user: 'tom' } }
  ]


  */
