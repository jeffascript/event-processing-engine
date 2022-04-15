// define the class structure for the event processor

type MapReturnType<T> = (data: T) => T;

type FilterReturnType<T> = (data: T) => boolean;

//generic handler type
type Handler<T> = {
  [Property in keyof T as `map${Capitalize<string & Property>}`]?: MapReturnType<T[Property]>;
} & {
  [Property in keyof T as `filter${Capitalize<string & Property>}`]?: FilterReturnType<T[Property]>;
};

type ProcessEvent<T> = {
  eventName: keyof T;
  eventData: T[keyof T];
};

//shorturl.at/rABIS
class EventProcessor<T extends object> {
  private handlers: Handler<T>[] = []; // [...handlers, {filterListing: () => boolean | undefined, mapListing: () => unknown}]
  private processed: ProcessEvent<T>[] = [];

  handleEvent<K extends keyof T>(eventName: K, eventData: T[K]): void {
    let allowEvent = true;

    //capitalise func
    const capitalize = (s: string) => `${s.charAt(0).toUpperCase()}${s.slice(1)}`;

    for (const handler of this.handlers) {
      const filterFunc = handler[`filter${capitalize(eventName as string)}` as keyof Handler<T>] as unknown as ((value: T[K]) => boolean) | undefined;
      if (filterFunc && !filterFunc(eventData)) {
        allowEvent = false;
        break;
      }
    }

    if (allowEvent) {
      let mappedEventData = { ...eventData }; //alternatively: Object.assign({}, eventData)

      for (const handler of this.handlers) {
        const mapFunc = handler[`map${capitalize(<string>eventName)}` as keyof Handler<T>] as unknown as MapReturnType<T[K]> | undefined;
        //as unknown as ((value: T[K]) => T[K]) | undefined;
        if (mapFunc) {
          mappedEventData = mapFunc(mappedEventData) as T[K];
        }
      }
      this.processed.push({ eventName, eventData: mappedEventData });
    }
  }

  addHandler(handler: Handler<T>) {
    this.handlers.push(handler);
  }

  getProcessedEvents(): ProcessEvent<T>[] {
    return this.processed;
  }
}

interface EventMap {
  addLogin: { username?: string; name?: string; hasAccess?: boolean };
  removeLogin: { username?: string };
}

class UserEventProcessor extends EventProcessor<EventMap> {}

const userEventProcessor = new UserEventProcessor();

userEventProcessor.addHandler({
  filterAddLogin: ({ username }) => Boolean(username), //data.user
  mapAddLogin: (data) => ({ ...data, hasAccess: Boolean(data.username && data.name) }),
});

userEventProcessor.handleEvent("addLogin", { name: "Joy", username: "userIsJoy" }); //exists
userEventProcessor.handleEvent("addLogin", { name: "tom" }); //does not exist
userEventProcessor.handleEvent("removeLogin", { username: "joyuser" }); //should work since it is an exisiting user

console.log(userEventProcessor.getProcessedEvents());
/*

 Expected Result:
 [
  {
    eventName: 'addLogin',
    eventData: { name: 'Joy', username: 'userIsJoy', hasAccess: true }
  },
  { eventName: 'removeLogin', eventData: { username: 'joyuser' } }
]


  */
