import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Route, Package, StickyNote, DollarSign,
  Search, Compass, Sparkles, Plus,
} from 'lucide-react';
import Button from './Button.jsx';

function EmptyShell({ icon: Icon, color, title, body, children }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-(--app-color-border) px-8 py-16 text-center">
      <div className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${color}`}>
        <Icon size={28} />
      </div>
      <h3 className="text-xl font-black text-(--app-color-text)">{title}</h3>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-(--app-color-text-muted)">{body}</p>
      {children && <div className="mt-7 flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  );
}

export function NoTripsEmptyState() {
  const navigate = useNavigate();
  return (
    <EmptyShell
      icon={MapPin}
      color="bg-indigo-50 text-indigo-600"
      title="No trips yet"
      body="Your travel adventures start here. Create your first trip and start building an itinerary."
    >
      <Button onClick={() => navigate('/trips/new')}>
        <Plus size={15} />
        Create your first trip
      </Button>
      <Button variant="secondary" onClick={() => navigate('/discover')}>
        <Compass size={15} />
        Browse cities for inspiration
      </Button>
    </EmptyShell>
  );
}

export function NoStopsEmptyState({ tripId }) {
  return (
    <EmptyShell
      icon={Route}
      color="bg-purple-50 text-purple-600"
      title="No stops planned yet"
      body="Search for a city above and click 'Add Stop' to start building your route. You can reorder stops and add activities to each one."
    />
  );
}

export function ActivitySearchPromptState() {
  return (
    <EmptyShell
      icon={Search}
      color="bg-sky-50 text-sky-600"
      title="Search for activities"
      body="Type in a city name, choose a category and budget, then hit Search. AI-powered suggestions will appear here."
    />
  );
}

export function NoActivityResultsState({ city }) {
  return (
    <EmptyShell
      icon={Compass}
      color="bg-orange-50 text-orange-500"
      title={`No results for "${city}"`}
      body="Try removing a filter, choosing a broader budget range, or searching a nearby major city."
    />
  );
}

export function EmptyPackingState() {
  return (
    <EmptyShell
      icon={Package}
      color="bg-emerald-50 text-emerald-600"
      title="Your packing list is empty"
      body="Add items above — or use AI suggestions to generate a personalised packing list based on your destinations and activities."
    />
  );
}

export function EmptyNotesState() {
  return (
    <EmptyShell
      icon={StickyNote}
      color="bg-yellow-50 text-yellow-600"
      title="No notes yet"
      body="Jot down hotel check-in info, local contacts, restaurant recommendations, or anything you don't want to forget."
    />
  );
}

export function EmptyBudgetState({ tripId }) {
  return (
    <EmptyShell
      icon={DollarSign}
      color="bg-green-50 text-green-600"
      title="No budget data yet"
      body="Add stops and activities to your trip first. The budget engine will automatically calculate cost estimates by city and activity type."
    >
      <Link to={`/trips/${tripId}/builder`}>
        <Button>
          <Route size={15} />
          Open Itinerary Builder
        </Button>
      </Link>
    </EmptyShell>
  );
}

export function NoCityResultsState({ query }) {
  return (
    <EmptyShell
      icon={Compass}
      color="bg-slate-100 text-slate-500"
      title={query ? `No cities matching "${query}"` : 'Search for a city'}
      body={
        query
          ? 'Try a different spelling, a nearby country, or a major hub city.'
          : 'Type a city name or country above to start exploring destinations.'
      }
    />
  );
}

export function AiPlannerPromptState() {
  return (
    <EmptyShell
      icon={Sparkles}
      color="bg-violet-50 text-violet-600"
      title="Your AI itinerary will appear here"
      body="Fill in the destination, duration, and budget on the left, then hit Generate. Gemini will build a full day-by-day plan in seconds."
    />
  );
}