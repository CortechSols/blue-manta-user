import { addDays, addHours, subDays } from "date-fns";
import type {
  CalendlyEvent,
  CalendlyMeeting,
  EventType,
  ConnectionStatus,
} from "@/types/calendly";
import type {
  Chatbot,
  ChatMessage,
  ChatResponse,
  OrganizationChatbotsResponse,
  OrganizationsListResponse,
} from "@/types/chatbot";

// Demo connection status
export const demoConnectionStatus: ConnectionStatus = {
  is_connected: true,
  scheduling_url: "https://calendly.com/demo-user",
  user_name: "Demo User",
};

// Demo event types
export const demoEventTypes: EventType[] = [
  {
    uri: "https://api.calendly.com/event_types/1",
    name: "30 Minute Meeting",
    description:
      "A standard 30-minute meeting for consultations and discussions.",
    duration: 30,
    kind: "solo",
    slug: "30min",
    color: "#0069ff",
    active: true,
    scheduling_url: "https://calendly.com/demo-user/30min",
    booking_method: "instant",
    type: "StandardEventType",
  },
  {
    uri: "https://api.calendly.com/event_types/2",
    name: "60 Minute Consultation",
    description: "Extended consultation for detailed project discussions.",
    duration: 60,
    kind: "solo",
    slug: "60min",
    color: "#00a2ff",
    active: true,
    scheduling_url: "https://calendly.com/demo-user/60min",
    booking_method: "instant",
    type: "StandardEventType",
  },
  {
    uri: "https://api.calendly.com/event_types/3",
    name: "Team Standup",
    description: "Daily team standup meeting.",
    duration: 15,
    kind: "group",
    slug: "standup",
    color: "#ff6900",
    active: false,
    scheduling_url: "https://calendly.com/demo-user/standup",
    booking_method: "instant",
    type: "GroupEventType",
  },
];

// Demo events (available time slots)
export const demoEvents: CalendlyEvent[] = [
  {
    uri: "https://api.calendly.com/scheduled_events/1",
    name: "Available: 30 Minute Meeting",
    status: "active",
    start_time: addHours(new Date(), 2).toISOString(),
    end_time: addHours(new Date(), 2.5).toISOString(),
    event_type: "https://api.calendly.com/event_types/1",
    invitees_counter: {
      total: 0,
      active: 0,
      limit: 1,
    },
  },
  {
    uri: "https://api.calendly.com/scheduled_events/2",
    name: "Available: 60 Minute Consultation",
    status: "active",
    start_time: addDays(new Date(), 1).toISOString(),
    end_time: addHours(addDays(new Date(), 1), 1).toISOString(),
    event_type: "https://api.calendly.com/event_types/2",
    invitees_counter: {
      total: 0,
      active: 0,
      limit: 1,
    },
  },
];

// Demo meetings (scheduled events with invitees)
export const demoMeetings: CalendlyMeeting[] = [
  {
    uri: "https://api.calendly.com/scheduled_events/meeting1",
    name: "30 Minute Meeting",
    status: "active",
    start_time: addDays(new Date(), 2).toISOString(),
    end_time: addHours(addDays(new Date(), 2), 0.5).toISOString(),
    event_type: "https://api.calendly.com/event_types/1",
    location: {
      type: "video",
      join_url: "https://meet.google.com/demo-link",
    },
    invitees_counter: {
      total: 1,
      active: 1,
      limit: 1,
    },
    invitees: [
      {
        uri: "https://api.calendly.com/invitees/1",
        email: "john.doe@example.com",
        name: "John Doe",
        status: "active",
        created_at: subDays(new Date(), 1).toISOString(),
        updated_at: subDays(new Date(), 1).toISOString(),
        timezone: "America/New_York",
        questions_and_answers: [
          {
            question: "What would you like to discuss?",
            answer: "Project planning and timeline review",
          },
        ],
      },
    ],
  },
  {
    uri: "https://api.calendly.com/scheduled_events/meeting2",
    name: "60 Minute Consultation",
    status: "active",
    start_time: addDays(new Date(), 3).toISOString(),
    end_time: addHours(addDays(new Date(), 3), 1).toISOString(),
    event_type: "https://api.calendly.com/event_types/2",
    location: {
      type: "phone",
      location: "+1 (555) 123-4567",
    },
    invitees_counter: {
      total: 1,
      active: 1,
      limit: 1,
    },
    invitees: [
      {
        uri: "https://api.calendly.com/invitees/2",
        email: "jane.smith@example.com",
        name: "Jane Smith",
        status: "active",
        created_at: subDays(new Date(), 2).toISOString(),
        updated_at: subDays(new Date(), 2).toISOString(),
        timezone: "America/Los_Angeles",
        questions_and_answers: [
          {
            question: "Company name?",
            answer: "Tech Innovations Inc.",
          },
          {
            question: "What services are you interested in?",
            answer: "Web development and consulting",
          },
        ],
      },
    ],
  },
  {
    uri: "https://api.calendly.com/scheduled_events/meeting3",
    name: "30 Minute Meeting",
    status: "cancelled",
    start_time: subDays(new Date(), 1).toISOString(),
    end_time: addHours(subDays(new Date(), 1), 0.5).toISOString(),
    event_type: "https://api.calendly.com/event_types/1",
    location: {
      type: "video",
      join_url: "https://zoom.us/j/demo-meeting",
    },
    invitees_counter: {
      total: 1,
      active: 0,
      limit: 1,
    },
    invitees: [
      {
        uri: "https://api.calendly.com/invitees/3",
        email: "bob.wilson@example.com",
        name: "Bob Wilson",
        status: "cancelled",
        created_at: subDays(new Date(), 3).toISOString(),
        updated_at: subDays(new Date(), 1).toISOString(),
        timezone: "America/Chicago",
      },
    ],
  },
];

// Helper function to check if we should use demo data
export const shouldUseDemoData = () => {
  return false;
};



// Demo API responses
export const demoApiResponses = {
  connectionStatus: () => Promise.resolve(demoConnectionStatus),
  eventTypes: () =>
    Promise.resolve({
      event_types: demoEventTypes,
      total_count: demoEventTypes.length,
    }),
  events: () =>
    Promise.resolve({
      events_by_date: {
        [new Date().toISOString().split("T")[0]]: demoEvents,
      },
      metadata: {
        total_count: demoEvents.length,
        date_range: {
          start_date: new Date().toISOString().split("T")[0],
          end_date: addDays(new Date(), 30).toISOString().split("T")[0],
        },
      },
    }),
  meetings: () =>
    Promise.resolve({
      meetings: demoMeetings,
      total_count: demoMeetings.length,
      date_range: {
        start_date: subDays(new Date(), 30).toISOString().split("T")[0],
        end_date: addDays(new Date(), 30).toISOString().split("T")[0],
      },
    }),
  availability: () => Promise.resolve({ schedules: [] }),
};
