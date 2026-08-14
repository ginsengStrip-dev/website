import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Edit3,
  Eye,
  EyeOff,
  ImagePlus,
  Images,
  LoaderCircle,
  Plus,
  RefreshCw,
  Save,
  Star,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  GalleryEvent,
  GalleryEventInput,
  GalleryImage,
  GalleryImageInput,
} from '../types';
import {
  createGalleryEvent,
  deleteGalleryEvent,
  deleteGalleryImage,
  fetchAdminGalleryEvents,
  reorderGalleryImages,
  replaceGalleryImage,
  updateGalleryEvent,
  updateGalleryImage,
  uploadGalleryImages,
} from '../lib/api';

const CURRENT_YEAR = new Date().getFullYear();
const MAX_EVENT_DATE = `${CURRENT_YEAR}-12-31`;
const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const EMPTY_EVENT_FORM: GalleryEventInput = {
  title: '',
  description: '',
  eventDate: '',
  status: 'ACTIVE',
};

interface PendingGalleryImage extends GalleryImageInput {
  key: string;
  file: File;
  previewUrl: string;
}

interface GalleryImageEditorProps {
  image: GalleryImage;
  position: number;
  total: number;
  onUpdate: (id: number, input: Partial<GalleryImageInput>) => Promise<void>;
  onReplace: (id: number, file: File) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onMove: (imageId: number, direction: -1 | 1) => Promise<void>;
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function getEventYear(eventDate: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(eventDate);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (
    year < 1 ||
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }

  return year;
}

function formatEventDate(value: string): string {
  const dateOnly = value.slice(0, 10);
  const date = new Date(`${dateOnly}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
    return `${file.name}: only JPEG, PNG, and WebP images are supported.`;
  }
  if (file.size <= 0) return `${file.name}: the file is empty.`;
  if (file.size > MAX_IMAGE_BYTES) {
    return `${file.name}: the file is larger than 12 MB.`;
  }
  return null;
}

function captionFromFileName(fileName: string): string {
  return fileName
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function GalleryImageEditor({
  image,
  position,
  total,
  onUpdate,
  onReplace,
  onDelete,
  onMove,
}: GalleryImageEditorProps) {
  const [draft, setDraft] = useState<GalleryImageInput>({
    caption: image.caption,
    altText: image.altText,
    displayOrder: image.displayOrder,
    isFeatured: image.isFeatured,
    isActive: image.isActive,
  });
  const [replacement, setReplacement] = useState<{ file: File; previewUrl: string } | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft({
      caption: image.caption,
      altText: image.altText,
      displayOrder: image.displayOrder,
      isFeatured: image.isFeatured,
      isActive: image.isActive,
    });
  }, [image]);

  useEffect(() => {
    return () => {
      if (replacement) URL.revokeObjectURL(replacement.previewUrl);
    };
  }, [replacement]);

  const isDirty =
    draft.caption !== image.caption ||
    draft.altText !== image.altText ||
    draft.displayOrder !== image.displayOrder ||
    draft.isFeatured !== image.isFeatured ||
    draft.isActive !== image.isActive;

  const runAction = async (name: string, action: () => Promise<void>) => {
    setBusyAction(name);
    setError(null);
    try {
      await action();
    } catch (actionError) {
      setError(errorMessage(actionError, 'The image could not be updated.'));
    } finally {
      setBusyAction(null);
    }
  };

  const handleSave = async () => {
    if (!draft.caption.trim() || !draft.altText.trim()) {
      setError('Caption and alt text are required for every gallery image.');
      return;
    }
    await runAction('save', () =>
      onUpdate(image.id, {
        ...draft,
        caption: draft.caption.trim(),
        altText: draft.altText.trim(),
        displayOrder: Math.max(1, Number(draft.displayOrder) || 1),
      }),
    );
  };

  const handleReplacementSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (replacement) URL.revokeObjectURL(replacement.previewUrl);
    setReplacement({ file, previewUrl: URL.createObjectURL(file) });
    setError(null);
  };

  const clearReplacement = () => {
    if (replacement) URL.revokeObjectURL(replacement.previewUrl);
    setReplacement(null);
  };

  const handleReplace = async () => {
    if (!replacement) return;
    const selected = replacement;
    await runAction('replace', async () => {
      await onReplace(image.id, selected.file);
      clearReplacement();
    });
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this gallery image permanently?')) return;
    await runAction('delete', () => onDelete(image.id));
  };

  const handleMove = async (direction: -1 | 1) => {
    await runAction(direction === -1 ? 'up' : 'down', () => onMove(image.id, direction));
  };

  const isBusy = busyAction !== null;
  const imageSource = replacement?.previewUrl || image.thumbnailUrl || image.imageUrl;

  return (
    <article className="overflow-hidden rounded-xl border border-[#e5dcd0] bg-white shadow-sm">
      <div className="relative aspect-[4/3] overflow-hidden bg-amber-100/50">
        <img
          src={imageSource}
          alt={replacement ? 'Preview of the selected replacement image' : image.altText}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
        <div className="absolute left-2 top-2 flex items-center gap-1.5">
          <span className="rounded-md bg-amber-950/90 px-2 py-1 text-[10px] font-bold text-amber-50 backdrop-blur-sm">
            Order {image.displayOrder}
          </span>
          {image.isFeatured && (
            <span className="inline-flex items-center gap-1 rounded-md bg-[#1d4f6e]/95 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
              <Star className="h-3 w-3" aria-hidden="true" /> Featured
            </span>
          )}
        </div>
        {!image.isActive && (
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md bg-zinc-900/85 px-2 py-1 text-[10px] font-bold text-white">
            <EyeOff className="h-3 w-3" aria-hidden="true" /> Hidden
          </span>
        )}
      </div>

      <div className="space-y-4 p-4">
        {replacement && (
          <div className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-xs text-sky-900">
            <p className="font-bold">Replacement preview: {replacement.file.name}</p>
            <p className="mt-0.5 text-[11px] text-sky-800">The current image remains unchanged until you confirm.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleReplace}
                disabled={isBusy}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-[#1d4f6e] px-3 py-2 text-[11px] font-bold text-white transition-colors hover:bg-[#163e57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d4f6e] focus-visible:ring-offset-2 disabled:opacity-50"
              >
                {busyAction === 'replace' ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                Confirm replacement
              </button>
              <button
                type="button"
                onClick={clearReplacement}
                disabled={isBusy}
                className="min-h-9 rounded-lg border border-sky-300 bg-white px-3 py-2 text-[11px] font-bold text-sky-900 hover:bg-sky-100 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor={`gallery-caption-${image.id}`} className="block text-[11px] font-bold uppercase tracking-wider text-amber-900/75">
            Caption <span className="text-rose-700">*</span>
          </label>
          <textarea
            id={`gallery-caption-${image.id}`}
            rows={2}
            value={draft.caption}
            onChange={event => setDraft(current => ({ ...current, caption: event.target.value }))}
            className="w-full rounded-lg border border-[#e5dcd0] bg-[#fbf8f1] px-3 py-2 text-xs text-amber-950 focus:border-amber-800 focus:outline-none focus:ring-1 focus:ring-amber-800"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor={`gallery-alt-${image.id}`} className="block text-[11px] font-bold uppercase tracking-wider text-amber-900/75">
            Alt text <span className="text-rose-700">*</span>
          </label>
          <input
            id={`gallery-alt-${image.id}`}
            type="text"
            value={draft.altText}
            onChange={event => setDraft(current => ({ ...current, altText: event.target.value }))}
            className="w-full rounded-lg border border-[#e5dcd0] bg-[#fbf8f1] px-3 py-2 text-xs text-amber-950 focus:border-amber-800 focus:outline-none focus:ring-1 focus:ring-amber-800"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <div className="space-y-1.5">
            <label htmlFor={`gallery-order-${image.id}`} className="block text-[11px] font-bold uppercase tracking-wider text-amber-900/75">
              Display order
            </label>
            <input
              id={`gallery-order-${image.id}`}
              type="number"
              min="1"
              value={draft.displayOrder}
              onChange={event =>
                setDraft(current => ({
                  ...current,
                  displayOrder: Math.max(1, Number(event.target.value) || 1),
                }))
              }
              className="w-full rounded-lg border border-[#e5dcd0] bg-[#fbf8f1] px-3 py-2 text-xs text-amber-950 focus:border-amber-800 focus:outline-none focus:ring-1 focus:ring-amber-800"
            />
          </div>

          <div className="flex items-center gap-1.5" aria-label="Reorder image">
            <button
              type="button"
              onClick={() => handleMove(-1)}
              disabled={isBusy || position === 0}
              className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-800 disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Move image earlier"
              title="Move earlier"
            >
              {busyAction === 'up' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => handleMove(1)}
              disabled={isBusy || position === total - 1}
              className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-800 disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Move image later"
              title="Move later"
            >
              {busyAction === 'down' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ArrowDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-3 border-y border-amber-200/70 py-3 text-xs font-semibold text-amber-950">
          <label className="inline-flex min-h-8 cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={draft.isActive}
              onChange={event => setDraft(current => ({ ...current, isActive: event.target.checked }))}
              className="h-4 w-4 accent-amber-900"
            />
            <Eye className="h-3.5 w-3.5 text-amber-800" aria-hidden="true" />
            Visible publicly
          </label>
          <label className="inline-flex min-h-8 cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={draft.isFeatured}
              onChange={event => setDraft(current => ({ ...current, isFeatured: event.target.checked }))}
              className="h-4 w-4 accent-amber-900"
            />
            <Star className="h-3.5 w-3.5 text-amber-800" aria-hidden="true" />
            Featured on homepage
          </label>
        </div>

        {error && (
          <p className="flex items-start gap-1.5 rounded-lg bg-rose-50 p-2.5 text-[11px] font-medium text-rose-800" role="alert">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-2 text-[11px] font-bold text-amber-950 transition-colors hover:bg-amber-50 focus-within:ring-2 focus-within:ring-amber-800 focus-within:ring-offset-2">
            <Upload className="h-3.5 w-3.5" aria-hidden="true" />
            Choose replacement
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleReplacementSelection}
              className="sr-only"
              disabled={isBusy}
            />
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isBusy}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-2 text-[11px] font-bold text-rose-800 transition-colors hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-700 focus-visible:ring-offset-2 disabled:opacity-50"
            >
              {busyAction === 'delete' ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              Delete
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isBusy || !isDirty}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-amber-900 px-3 py-2 text-[11px] font-bold text-amber-50 transition-colors hover:bg-amber-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-800 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {busyAction === 'save' ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save image
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export const AdminGalleryManagement: React.FC = () => {
  const [events, setEvents] = useState<GalleryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingEvent, setSavingEvent] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [eventForm, setEventForm] = useState<GalleryEventInput>({ ...EMPTY_EVENT_FORM });
  const [eventFormError, setEventFormError] = useState<string | null>(null);
  const [pendingImages, setPendingImages] = useState<PendingGalleryImage[]>([]);
  const [pendingFileError, setPendingFileError] = useState<string | null>(null);
  const [expandedEventIds, setExpandedEventIds] = useState<Set<number>>(new Set());
  const [busyEventId, setBusyEventId] = useState<number | null>(null);
  const previewUrls = useRef<Set<string>>(new Set());
  const eventFormRef = useRef<HTMLDivElement | null>(null);

  const loadEvents = useCallback(async (background = false) => {
    if (background) setRefreshing(true);
    else setLoading(true);
    setPageError(null);
    try {
      const loadedEvents = await fetchAdminGalleryEvents();
      setEvents(loadedEvents);
    } catch (error) {
      setPageError(errorMessage(error, 'Gallery events could not be loaded.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    const urls = previewUrls.current;
    return () => {
      urls.forEach(url => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  const editingEvent = useMemo(
    () => events.find(event => event.id === editingEventId) || null,
    [editingEventId, events],
  );
  const derivedYear = getEventYear(eventForm.eventDate);
  const totalImages = events.reduce(
    (total, event) => total + (event.imageCount ?? event.images?.length ?? 0),
    0,
  );
  const activeEvents = events.filter(event => event.status === 'ACTIVE').length;

  const releasePendingPreviews = () => {
    setPendingImages(current => {
      current.forEach(item => {
        URL.revokeObjectURL(item.previewUrl);
        previewUrls.current.delete(item.previewUrl);
      });
      return [];
    });
  };

  const resetForm = () => {
    releasePendingPreviews();
    setShowEventForm(false);
    setEditingEventId(null);
    setEventForm({ ...EMPTY_EVENT_FORM });
    setEventFormError(null);
    setPendingFileError(null);
  };

  const scrollToForm = () => {
    window.requestAnimationFrame(() => {
      eventFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const openCreateForm = () => {
    releasePendingPreviews();
    setEditingEventId(null);
    setEventForm({ ...EMPTY_EVENT_FORM });
    setEventFormError(null);
    setPendingFileError(null);
    setShowEventForm(true);
    scrollToForm();
  };

  const openEditForm = (event: GalleryEvent) => {
    releasePendingPreviews();
    setEditingEventId(event.id);
    setEventForm({
      title: event.title,
      description: event.description || '',
      eventDate: event.eventDate.slice(0, 10),
      status: event.status,
    });
    setEventFormError(null);
    setPendingFileError(null);
    setShowEventForm(true);
    scrollToForm();
  };

  const nextPendingOrder = () => {
    const existingOrders = editingEvent?.images?.map(image => image.displayOrder) || [];
    const pendingOrders = pendingImages.map(image => image.displayOrder);
    return Math.max(0, ...existingOrders, ...pendingOrders) + 1;
  };

  const handleNewFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles: File[] = [];
    const fileList = event.currentTarget.files;
    if (fileList) {
      for (let index = 0; index < fileList.length; index += 1) {
        const file = fileList.item(index);
        if (file) selectedFiles.push(file);
      }
    }
    event.target.value = '';
    if (selectedFiles.length === 0) return;

    const errors: string[] = [];
    const validFiles = selectedFiles.filter(file => {
      const validationError = validateImageFile(file);
      if (validationError) errors.push(validationError);
      return !validationError;
    });

    let order = nextPendingOrder();
    const additions = validFiles.map((file, index): PendingGalleryImage => {
      const previewUrl = URL.createObjectURL(file);
      previewUrls.current.add(previewUrl);
      return {
        key: `${Date.now()}-${index}-${file.name}`,
        file,
        previewUrl,
        caption: captionFromFileName(file.name),
        altText: '',
        displayOrder: order++,
        isFeatured: false,
        isActive: true,
      };
    });

    setPendingImages(current => [...current, ...additions]);
    setPendingFileError(errors.length > 0 ? errors.join(' ') : null);
  };

  const updatePendingImage = (key: string, input: Partial<GalleryImageInput>) => {
    setPendingImages(current =>
      current.map(item => (item.key === key ? { ...item, ...input } : item)),
    );
  };

  const removePendingImage = (key: string) => {
    setPendingImages(current => {
      const removed = current.find(item => item.key === key);
      if (removed) {
        URL.revokeObjectURL(removed.previewUrl);
        previewUrls.current.delete(removed.previewUrl);
      }
      const remaining = current.filter(item => item.key !== key);
      const baseOrder = Math.max(
        0,
        ...(editingEvent?.images?.map(image => image.displayOrder) || []),
      );
      return remaining.map((item, index) => ({ ...item, displayOrder: baseOrder + index + 1 }));
    });
  };

  const movePendingImage = (index: number, direction: -1 | 1) => {
    setPendingImages(current => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const reordered = [...current];
      [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
      const baseOrder = Math.max(
        0,
        ...(editingEvent?.images?.map(image => image.displayOrder) || []),
      );
      return reordered.map((item, itemIndex) => ({
        ...item,
        displayOrder: baseOrder + itemIndex + 1,
      }));
    });
  };

  const validateEventForm = (): string | null => {
    if (!eventForm.title.trim()) return 'Event title is required.';
    const year = getEventYear(eventForm.eventDate);
    if (!year) return 'Choose a valid event date.';
    if (year > CURRENT_YEAR) {
      return `Events for ${year} cannot be created. The latest permitted gallery year is ${CURRENT_YEAR}.`;
    }
    const invalidPending = pendingImages.find(
      image => !image.caption.trim() || !image.altText.trim(),
    );
    if (invalidPending) {
      return 'Add a caption and meaningful alt text for every selected image.';
    }
    return null;
  };

  const handleSaveEvent = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationError = validateEventForm();
    if (validationError) {
      setEventFormError(validationError);
      return;
    }

    const input: GalleryEventInput = {
      title: eventForm.title.trim(),
      description: eventForm.description?.trim() || '',
      eventDate: eventForm.eventDate,
      status: eventForm.status,
    };

    setSavingEvent(true);
    setEventFormError(null);
    setNotice(null);
    let savedEvent: GalleryEvent | null = null;

    try {
      savedEvent = editingEventId
        ? await updateGalleryEvent(editingEventId, input)
        : await createGalleryEvent(input);

      if (pendingImages.length > 0) {
        await uploadGalleryImages(
          savedEvent.id,
          pendingImages.map(image => image.file),
          pendingImages.map(image => ({
            caption: image.caption.trim(),
            altText: image.altText.trim(),
            displayOrder: image.displayOrder,
            isFeatured: image.isFeatured,
            isActive: image.isActive,
          })),
        );
      }

      const action = editingEventId ? 'updated' : 'created';
      resetForm();
      setNotice(`Gallery event ${action} successfully.`);
      await loadEvents(true);
    } catch (error) {
      if (savedEvent) {
        setEditingEventId(savedEvent.id);
        setEventForm({
          title: savedEvent.title,
          description: savedEvent.description || '',
          eventDate: savedEvent.eventDate.slice(0, 10),
          status: savedEvent.status,
        });
        setEventFormError(
          `The event was saved, but its selected images were not uploaded. ${errorMessage(error, 'Please try the image upload again.')}`,
        );
        await loadEvents(true);
      } else {
        setEventFormError(errorMessage(error, 'The gallery event could not be saved.'));
      }
    } finally {
      setSavingEvent(false);
    }
  };

  const handleDeleteEvent = async (event: GalleryEvent) => {
    const imageCount = event.imageCount ?? event.images?.length ?? 0;
    const warning = imageCount > 0
      ? `Delete “${event.title}” and all ${imageCount} of its images permanently?`
      : `Delete “${event.title}” permanently?`;
    if (!window.confirm(warning)) return;

    setBusyEventId(event.id);
    setPageError(null);
    setNotice(null);
    try {
      await deleteGalleryEvent(event.id);
      setEvents(current => current.filter(item => item.id !== event.id));
      if (editingEventId === event.id) resetForm();
      setNotice('Gallery event deleted.');
    } catch (error) {
      setPageError(errorMessage(error, 'The gallery event could not be deleted.'));
    } finally {
      setBusyEventId(null);
    }
  };

  const handleToggleEventStatus = async (event: GalleryEvent) => {
    setBusyEventId(event.id);
    setPageError(null);
    try {
      const updated = await updateGalleryEvent(event.id, {
        title: event.title,
        description: event.description || '',
        eventDate: event.eventDate.slice(0, 10),
        status: event.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
      });
      setEvents(current =>
        current.map(item =>
          item.id === event.id
            ? { ...item, ...updated, images: item.images }
            : item,
        ),
      );
    } catch (error) {
      setPageError(errorMessage(error, 'The event status could not be changed.'));
    } finally {
      setBusyEventId(null);
    }
  };

  const handleUpdateImage = async (id: number, input: Partial<GalleryImageInput>) => {
    const updated = await updateGalleryImage(id, input);
    setEvents(current =>
      current.map(event => ({
        ...event,
        images: (event.images || [])
          .map(image => (image.id === id ? updated : image))
          .sort((a, b) => a.displayOrder - b.displayOrder || a.id - b.id),
      })),
    );
  };

  const handleReplaceImage = async (id: number, file: File) => {
    const updated = await replaceGalleryImage(id, file);
    setEvents(current =>
      current.map(event => ({
        ...event,
        images: (event.images || []).map(image => (image.id === id ? updated : image)),
      })),
    );
  };

  const handleDeleteImage = async (id: number) => {
    await deleteGalleryImage(id);
    setEvents(current =>
      current.map(event =>
        event.images?.some(image => image.id === id)
          ? {
              ...event,
              images: event.images.filter(image => image.id !== id),
              imageCount: Math.max(0, (event.imageCount ?? event.images.length) - 1),
            }
          : event,
      ),
    );
  };

  const handleMoveImage = async (eventId: number, imageId: number, direction: -1 | 1) => {
    const galleryEvent = events.find(event => event.id === eventId);
    if (!galleryEvent) return;
    const ordered = [...(galleryEvent.images || [])].sort(
      (a, b) => a.displayOrder - b.displayOrder || a.id - b.id,
    );
    const currentIndex = ordered.findIndex(image => image.id === imageId);
    const targetIndex = currentIndex + direction;
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= ordered.length) return;

    [ordered[currentIndex], ordered[targetIndex]] = [ordered[targetIndex], ordered[currentIndex]];
    const updated = await reorderGalleryImages(eventId, ordered.map(image => image.id));
    setEvents(current =>
      current.map(event => (event.id === eventId ? { ...event, images: updated } : event)),
    );
  };

  const toggleExpanded = (eventId: number) => {
    setExpandedEventIds(current => {
      const next = new Set(current);
      if (next.has(eventId)) next.delete(eventId);
      else next.add(eventId);
      return next;
    });
  };

  return (
    <section className="space-y-6" aria-labelledby="gallery-management-heading">
      <div className="flex flex-col gap-4 border-b border-amber-200/80 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-amber-800">
            Event photography archive
          </span>
          <h2 id="gallery-management-heading" className="font-serif text-2xl font-bold text-amber-950">
            Gallery Management
          </h2>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-amber-900/75">
            Create dated event collections, prepare accessible image metadata, and control what appears in the public gallery and homepage.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber-900 px-4 py-2.5 text-xs font-bold text-amber-50 shadow-sm transition-colors hover:bg-amber-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-800 focus-visible:ring-offset-2"
        >
          <Plus className="h-4 w-4 text-amber-300" aria-hidden="true" />
          Create Event Gallery
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#e5dcd0] bg-[#fbf8f1] p-4 shadow-sm">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-amber-800">Events</span>
          <span className="font-serif text-2xl font-bold text-amber-950">{events.length}</span>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-emerald-800">Active</span>
          <span className="font-serif text-2xl font-bold text-emerald-900">{activeEvents}</span>
        </div>
        <div className="col-span-2 rounded-2xl border border-[#e5dcd0] bg-[#fbf8f1] p-4 shadow-sm sm:col-span-1">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-amber-800">Photographs</span>
          <span className="font-serif text-2xl font-bold text-amber-950">{totalImages}</span>
        </div>
      </div>

      {pageError && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800" role="alert">
          <span className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {pageError}
          </span>
          <button
            type="button"
            onClick={() => void loadEvents(true)}
            className="shrink-0 font-bold underline decoration-rose-300 underline-offset-2 hover:text-rose-950"
          >
            Retry
          </button>
        </div>
      )}

      {notice && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800" role="status">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          {notice}
        </div>
      )}

      {showEventForm && (
        <div ref={eventFormRef} className="scroll-mt-24 rounded-2xl border border-[#e5dcd0] bg-[#fbf8f1] p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-4 border-b border-amber-200/80 pb-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-amber-950">
                {editingEventId ? 'Edit Event Gallery' : 'Create Event Gallery'}
              </h3>
              <p className="mt-1 text-[11px] leading-relaxed text-amber-900/70">
                The gallery year is derived automatically from the event date. Years after {CURRENT_YEAR} are not accepted.
              </p>
            </div>
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg text-amber-900 hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-800"
              aria-label="Close event form"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSaveEvent} className="space-y-6">
            <fieldset disabled={savingEvent} className="space-y-5 disabled:opacity-75">
              <legend className="sr-only">Event information</legend>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1.5 md:col-span-2">
                  <label htmlFor="gallery-event-title" className="block text-xs font-bold text-amber-950">
                    Event title <span className="text-rose-700">*</span>
                  </label>
                  <input
                    id="gallery-event-title"
                    type="text"
                    required
                    value={eventForm.title}
                    onChange={event => setEventForm(current => ({ ...current, title: event.target.value }))}
                    placeholder="e.g. Manuscript Preservation Workshop"
                    className="w-full rounded-xl border border-[#e5dcd0] bg-white px-3.5 py-2.5 text-sm text-amber-950 placeholder:text-amber-900/35 focus:border-amber-800 focus:outline-none focus:ring-1 focus:ring-amber-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="gallery-event-date" className="block text-xs font-bold text-amber-950">
                    Event date <span className="text-rose-700">*</span>
                  </label>
                  <input
                    id="gallery-event-date"
                    type="date"
                    required
                    max={MAX_EVENT_DATE}
                    value={eventForm.eventDate}
                    onChange={event => {
                      setEventForm(current => ({ ...current, eventDate: event.target.value }));
                      setEventFormError(null);
                    }}
                    className="w-full rounded-xl border border-[#e5dcd0] bg-white px-3.5 py-2.5 text-sm text-amber-950 focus:border-amber-800 focus:outline-none focus:ring-1 focus:ring-amber-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <span className="block text-xs font-bold text-amber-950">Gallery year</span>
                  <div className="flex min-h-[42px] items-center gap-2 rounded-xl border border-amber-200 bg-amber-100/60 px-3.5 py-2.5 text-sm font-bold text-amber-950" aria-live="polite">
                    <CalendarDays className="h-4 w-4 text-amber-800" aria-hidden="true" />
                    {derivedYear || 'Choose an event date'}
                    <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-amber-800/70">Automatic</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="gallery-event-status" className="block text-xs font-bold text-amber-950">Publishing status</label>
                  <select
                    id="gallery-event-status"
                    value={eventForm.status}
                    onChange={event =>
                      setEventForm(current => ({
                        ...current,
                        status: event.target.value as GalleryEventInput['status'],
                      }))
                    }
                    className="w-full rounded-xl border border-[#e5dcd0] bg-white px-3.5 py-2.5 text-sm font-semibold text-amber-950 focus:border-amber-800 focus:outline-none focus:ring-1 focus:ring-amber-800"
                  >
                    <option value="ACTIVE">ACTIVE — visible publicly</option>
                    <option value="INACTIVE">INACTIVE — hidden from public</option>
                  </select>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label htmlFor="gallery-event-description" className="block text-xs font-bold text-amber-950">Event description (optional)</label>
                  <textarea
                    id="gallery-event-description"
                    rows={4}
                    value={eventForm.description || ''}
                    onChange={event => setEventForm(current => ({ ...current, description: event.target.value }))}
                    placeholder="Add context about the programme, venue, participants, or preservation work."
                    className="w-full rounded-xl border border-[#e5dcd0] bg-white px-3.5 py-2.5 text-sm leading-relaxed text-amber-950 placeholder:text-amber-900/35 focus:border-amber-800 focus:outline-none focus:ring-1 focus:ring-amber-800"
                  />
                </div>
              </div>

              <div className="space-y-4 border-t border-amber-200/80 pt-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="font-serif text-base font-bold text-amber-950">
                      {editingEventId ? 'Add More Photographs' : 'Event Photographs'}
                    </h4>
                    <p className="mt-0.5 text-[11px] text-amber-900/70">JPEG, PNG, or WebP; maximum 12 MB per image. Preview and describe every image before saving.</p>
                  </div>
                  <label className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-xs font-bold text-amber-950 transition-colors hover:bg-amber-50 focus-within:ring-2 focus-within:ring-amber-800 focus-within:ring-offset-2">
                    <ImagePlus className="h-4 w-4 text-amber-800" aria-hidden="true" />
                    Select Images
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleNewFiles}
                      className="sr-only"
                    />
                  </label>
                </div>

                {pendingFileError && (
                  <p className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-[11px] font-medium text-rose-800" role="alert">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {pendingFileError}
                  </p>
                )}

                {pendingImages.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {pendingImages.map((image, index) => (
                      <article key={image.key} className="overflow-hidden rounded-xl border border-amber-200 bg-white">
                        <div className="relative aspect-[16/9] overflow-hidden bg-amber-100/50">
                          <img src={image.previewUrl} alt="New upload preview" className="h-full w-full object-cover" />
                          <span className="absolute left-2 top-2 rounded-md bg-amber-950/90 px-2 py-1 text-[10px] font-bold text-amber-50">
                            New · Order {image.displayOrder}
                          </span>
                          <button
                            type="button"
                            onClick={() => removePendingImage(image.key)}
                            className="absolute right-2 top-2 inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg bg-rose-700 text-white shadow-sm hover:bg-rose-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                            aria-label={`Remove ${image.file.name}`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="space-y-3 p-4">
                          <p className="truncate text-[11px] font-semibold text-amber-900/70" title={image.file.name}>{image.file.name}</p>
                          <div className="space-y-1.5">
                            <label htmlFor={`pending-caption-${image.key}`} className="block text-[11px] font-bold uppercase tracking-wider text-amber-900/75">
                              Caption <span className="text-rose-700">*</span>
                            </label>
                            <input
                              id={`pending-caption-${image.key}`}
                              type="text"
                              required
                              value={image.caption}
                              onChange={event => updatePendingImage(image.key, { caption: event.target.value })}
                              className="w-full rounded-lg border border-[#e5dcd0] bg-[#fbf8f1] px-3 py-2 text-xs text-amber-950 focus:border-amber-800 focus:outline-none focus:ring-1 focus:ring-amber-800"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label htmlFor={`pending-alt-${image.key}`} className="block text-[11px] font-bold uppercase tracking-wider text-amber-900/75">
                              Alt text <span className="text-rose-700">*</span>
                            </label>
                            <input
                              id={`pending-alt-${image.key}`}
                              type="text"
                              required
                              value={image.altText}
                              onChange={event => updatePendingImage(image.key, { altText: event.target.value })}
                              placeholder="Describe what is visible in the photograph"
                              className="w-full rounded-lg border border-[#e5dcd0] bg-[#fbf8f1] px-3 py-2 text-xs text-amber-950 placeholder:text-amber-900/35 focus:border-amber-800 focus:outline-none focus:ring-1 focus:ring-amber-800"
                            />
                          </div>
                          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-amber-200/70 pt-3">
                            <div className="flex flex-wrap gap-4 text-[11px] font-semibold text-amber-950">
                              <label className="inline-flex cursor-pointer items-center gap-1.5">
                                <input
                                  type="checkbox"
                                  checked={image.isActive}
                                  onChange={event => updatePendingImage(image.key, { isActive: event.target.checked })}
                                  className="h-4 w-4 accent-amber-900"
                                />
                                Active
                              </label>
                              <label className="inline-flex cursor-pointer items-center gap-1.5">
                                <input
                                  type="checkbox"
                                  checked={image.isFeatured}
                                  onChange={event => updatePendingImage(image.key, { isFeatured: event.target.checked })}
                                  className="h-4 w-4 accent-amber-900"
                                />
                                Featured
                              </label>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => movePendingImage(index, -1)}
                                disabled={index === 0}
                                className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 disabled:opacity-35"
                                aria-label="Move selected image earlier"
                              >
                                <ArrowUp className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => movePendingImage(index, 1)}
                                disabled={index === pendingImages.length - 1}
                                className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 disabled:opacity-35"
                                aria-label="Move selected image later"
                              >
                                <ArrowDown className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border-2 border-dashed border-amber-200 bg-white/60 px-5 py-8 text-center">
                    <Images className="mx-auto h-8 w-8 text-amber-700/55" aria-hidden="true" />
                    <p className="mt-2 text-xs font-bold text-amber-950">No new images selected</p>
                    <p className="mt-1 text-[11px] text-amber-900/65">You can save the event now and add images later.</p>
                  </div>
                )}
              </div>
            </fieldset>

            {eventFormError && (
              <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800" role="alert">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                {eventFormError}
              </div>
            )}

            <div className="flex flex-col-reverse gap-2 border-t border-amber-200/80 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={resetForm}
                disabled={savingEvent}
                className="min-h-11 rounded-xl border border-amber-300 bg-white px-5 py-2.5 text-xs font-bold text-amber-950 transition-colors hover:bg-amber-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingEvent}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber-900 px-5 py-2.5 text-xs font-bold text-amber-50 shadow-sm transition-colors hover:bg-amber-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-800 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
              >
                {savingEvent ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 text-amber-300" />}
                {savingEvent
                  ? pendingImages.length > 0 ? 'Saving & Uploading…' : 'Saving Event…'
                  : editingEventId ? 'Save Event Changes' : 'Create Event Gallery'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <h3 className="font-serif text-lg font-bold text-amber-950">Event Galleries</h3>
        <button
          type="button"
          onClick={() => void loadEvents(true)}
          disabled={refreshing || loading}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-2 text-[11px] font-bold text-amber-950 hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-800 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4" aria-label="Loading gallery events" aria-busy="true">
          {[0, 1, 2].map(item => (
            <div key={item} className="h-28 animate-pulse rounded-2xl border border-[#e5dcd0] bg-[#fbf8f1]" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-2xl border border-[#e5dcd0] bg-[#fbf8f1] px-6 py-12 text-center shadow-sm">
          <Images className="mx-auto h-10 w-10 text-amber-700/50" aria-hidden="true" />
          <h4 className="mt-3 font-serif text-lg font-bold text-amber-950">No event galleries yet</h4>
          <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-amber-900/70">Create the first dated event, then upload and describe its photographs.</p>
          <button
            type="button"
            onClick={openCreateForm}
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-amber-900 px-4 py-2.5 text-xs font-bold text-amber-50 hover:bg-amber-950"
          >
            <Plus className="h-4 w-4" /> Create First Gallery
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map(event => {
            const expanded = expandedEventIds.has(event.id);
            const orderedImages = [...(event.images || [])].sort(
              (a, b) => a.displayOrder - b.displayOrder || a.id - b.id,
            );
            const imageCount = event.imageCount ?? orderedImages.length;
            const eventBusy = busyEventId === event.id;

            return (
              <article key={event.id} className="overflow-hidden rounded-2xl border border-[#e5dcd0] bg-[#fbf8f1] shadow-sm">
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-900">
                        <CalendarDays className="h-3 w-3" aria-hidden="true" /> {formatEventDate(event.eventDate)}
                      </span>
                      <span className="rounded-md bg-amber-900/10 px-2 py-1 text-[10px] font-bold text-amber-950">{event.eventYear}</span>
                      <span className={`rounded-md px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider ${
                        event.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-zinc-200 text-zinc-700'
                      }`}>
                        {event.status}
                      </span>
                    </div>
                    <h4 className="truncate font-serif text-lg font-bold text-amber-950">{event.title}</h4>
                    {event.description && <p className="mt-1 line-clamp-2 max-w-3xl text-xs leading-relaxed text-amber-900/70">{event.description}</p>}
                    <p className="mt-2 text-[11px] font-semibold text-amber-800">{imageCount} {imageCount === 1 ? 'photograph' : 'photographs'}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => void handleToggleEventStatus(event)}
                      disabled={eventBusy}
                      className={`inline-flex min-h-10 items-center gap-1.5 rounded-lg border px-3 py-2 text-[11px] font-bold transition-colors disabled:opacity-50 ${
                        event.status === 'ACTIVE'
                          ? 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100'
                          : 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      }`}
                    >
                      {eventBusy ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : event.status === 'ACTIVE' ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      {event.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditForm(event)}
                      disabled={eventBusy}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-2 text-[11px] font-bold text-amber-950 hover:bg-amber-50 disabled:opacity-50"
                    >
                      <Edit3 className="h-3.5 w-3.5" /> Edit / Add Images
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDeleteEvent(event)}
                      disabled={eventBusy}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-2 text-[11px] font-bold text-rose-800 hover:bg-rose-100 disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleExpanded(event.id)}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-amber-900 px-3 py-2 text-[11px] font-bold text-amber-50 hover:bg-amber-950"
                      aria-expanded={expanded}
                      aria-controls={`gallery-event-images-${event.id}`}
                    >
                      {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      {expanded ? 'Hide Images' : 'Manage Images'}
                    </button>
                  </div>
                </div>

                {expanded && (
                  <div id={`gallery-event-images-${event.id}`} className="border-t border-amber-200/80 bg-amber-50/35 p-4 sm:p-5">
                    {orderedImages.length === 0 ? (
                      <div className="rounded-xl border-2 border-dashed border-amber-200 bg-white/70 px-5 py-8 text-center">
                        <ImagePlus className="mx-auto h-8 w-8 text-amber-700/50" aria-hidden="true" />
                        <p className="mt-2 text-xs font-bold text-amber-950">This event has no photographs.</p>
                        <button type="button" onClick={() => openEditForm(event)} className="mt-3 text-xs font-bold text-amber-800 underline underline-offset-4 hover:text-amber-950">Add photographs</button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                        {orderedImages.map((image, position) => (
                          <div key={image.id}>
                            <GalleryImageEditor
                              image={image}
                              position={position}
                              total={orderedImages.length}
                              onUpdate={handleUpdateImage}
                              onReplace={handleReplaceImage}
                              onDelete={handleDeleteImage}
                              onMove={(imageId, direction) => handleMoveImage(event.id, imageId, direction)}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
