import { gql, type TypedDocumentNode } from "@apollo/client";
import { apolloClient } from "@/src/shared/api/apolloClient";
import {
  monthRange,
  parseLocalDateTime,
  toGraphQLDateTimeString,
} from "@/src/features/calendar/eventDateUtils";

export type EventProfile = {
  id: string;
  nickname: string;
};

export type HouseholdEvent = {
  id: number;
  name: string;
  description?: string | null;
  startTime: string;
  endTime: string;
  householdId?: string;
  creator?: EventProfile | null;
  attendees?: EventProfile[];
};

const EVENT_FIELDS = gql`
  fragment EventFields on Event {
    id
    name
    description
    startTime
    endTime
    householdId
    creator {
      id
      nickname
    }
    attendees {
      id
      nickname
    }
  }
`;

type EventsQueryResult = { events: HouseholdEvent[] };
type EventsQueryVars = { householdId: string; from: string; to: string };

export const HOUSEHOLD_EVENTS: TypedDocumentNode<EventsQueryResult, EventsQueryVars> = gql`
  query HouseholdEvents($householdId: String!, $from: DateTime, $to: DateTime) {
    events(householdId: $householdId, from: $from, to: $to) {
      ...EventFields
    }
  }
  ${EVENT_FIELDS}
`;

type EventDetailResult = { event: HouseholdEvent };
type EventDetailVars = { eventId: number };

export const EVENT_DETAIL: TypedDocumentNode<EventDetailResult, EventDetailVars> = gql`
  query EventDetail($eventId: Int!) {
    event(eventId: $eventId) {
      ...EventFields
    }
  }
  ${EVENT_FIELDS}
`;

const UPCOMING_DAYS = 30;
const HOME_EVENTS_LIMIT = 5;

function sortByStart(events: HouseholdEvent[]): HouseholdEvent[] {
  return [...events].sort(
    (a, b) =>
      parseLocalDateTime(a.startTime).getTime() - parseLocalDateTime(b.startTime).getTime(),
  );
}

export async function fetchEventsForMonth(
  householdId: string,
  year: number,
  month: number,
): Promise<HouseholdEvent[]> {
  const { from, to } = monthRange(year, month);
  const { data } = await apolloClient.query({
    query: HOUSEHOLD_EVENTS,
    variables: { householdId, from, to },
    fetchPolicy: "network-only",
  });
  const events = (data?.events ?? []).filter((e): e is HouseholdEvent => e != null);
  return sortByStart(events);
}

export async function fetchUpcomingEvents(householdId: string): Promise<HouseholdEvent[]> {
  const from = new Date();
  const to = new Date();
  to.setDate(to.getDate() + UPCOMING_DAYS);

  const { data } = await apolloClient.query({
    query: HOUSEHOLD_EVENTS,
    variables: {
      householdId,
      from: toGraphQLDateTimeString(from),
      to: toGraphQLDateTimeString(to),
    },
    fetchPolicy: "network-only",
  });

  const events = (data?.events ?? []).filter((e): e is HouseholdEvent => e != null);
  return sortByStart(events).slice(0, HOME_EVENTS_LIMIT);
}

export async function fetchEvent(eventId: number): Promise<HouseholdEvent | null> {
  const { data } = await apolloClient.query({
    query: EVENT_DETAIL,
    variables: { eventId },
    fetchPolicy: "network-only",
  });
  return data?.event ?? null;
}

type AddEventVars = {
  householdId: string;
  name: string;
  description?: string | null;
  startTime: string;
  endTime: string;
  attendeeIds: string[];
};

type AddEventResult = { addEvent: HouseholdEvent };

export const ADD_EVENT: TypedDocumentNode<AddEventResult, AddEventVars> = gql`
  mutation AddEvent(
    $householdId: String!
    $name: String!
    $description: String
    $startTime: DateTime!
    $endTime: DateTime!
    $attendeeIds: [String!]!
  ) {
    addEvent(
      householdId: $householdId
      name: $name
      description: $description
      startTime: $startTime
      endTime: $endTime
      attendeeIds: $attendeeIds
    ) {
      ...EventFields
    }
  }
  ${EVENT_FIELDS}
`;

type UpdateEventVars = {
  eventId: number;
  name?: string | null;
  description?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  attendeeIds: string[];
};

type UpdateEventResult = { updateEvent: HouseholdEvent };

export const UPDATE_EVENT: TypedDocumentNode<UpdateEventResult, UpdateEventVars> = gql`
  mutation UpdateEvent(
    $eventId: Int!
    $name: String
    $description: String
    $startTime: DateTime
    $endTime: DateTime
    $attendeeIds: [String!]!
  ) {
    updateEvent(
      eventId: $eventId
      name: $name
      description: $description
      startTime: $startTime
      endTime: $endTime
      attendeeIds: $attendeeIds
    ) {
      ...EventFields
    }
  }
  ${EVENT_FIELDS}
`;

type DeleteEventVars = { eventId: number };
type DeleteEventResult = { deleteEvent: boolean };

export const DELETE_EVENT: TypedDocumentNode<DeleteEventResult, DeleteEventVars> = gql`
  mutation DeleteEvent($eventId: Int!) {
    deleteEvent(eventId: $eventId)
  }
`;

export async function createEvent(
  householdId: string,
  input: Omit<AddEventVars, "householdId" | "attendeeIds"> & { attendeeIds?: string[] },
): Promise<HouseholdEvent> {
  const { data } = await apolloClient.mutate({
    mutation: ADD_EVENT,
    variables: { householdId, attendeeIds: input.attendeeIds ?? [], ...input },
  });
  if (!data?.addEvent) throw new Error("Could not create event");
  return data.addEvent;
}

export async function updateEvent(input: UpdateEventVars): Promise<HouseholdEvent> {
  const { data } = await apolloClient.mutate({
    mutation: UPDATE_EVENT,
    variables: input,
  });
  if (!data?.updateEvent) throw new Error("Could not update event");
  return data.updateEvent;
}

export async function deleteEvent(eventId: number): Promise<void> {
  const { data } = await apolloClient.mutate({
    mutation: DELETE_EVENT,
    variables: { eventId },
  });
  if (!data?.deleteEvent) throw new Error("Could not delete event");
}

/** @deprecated use HOUSEHOLD_EVENTS */
export const UPCOMING_EVENTS = HOUSEHOLD_EVENTS;
