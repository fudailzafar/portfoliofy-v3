# Portfoliofy Architecture & Developer Guide

Welcome to the Portfoliofy codebase! This document is designed to help new developers understand the core architecture, data flow, and standard patterns used throughout the project.

---

## 1. High-Level Architecture

Portfoliofy uses **Next.js 16** (App Router) and is divided into two primary contexts:

1.  **Public Portfolios (`app/[username]/page.tsx`)**:
    - **Goal**: SEO, speed, and clean presentation.
    - **Implementation**: Fully Server-Side Rendered (SSR) using React Server Components. We fetch data directly from the Supabase database and render the user's portfolio. No heavy editor bundles are loaded here.
2.  **The Editor (`app/[username]/_components/resume/editing/EditProfileDialog.tsx`)**:
    - **Goal**: Rich interactivity, instantaneous feedback, and complex state management.
    - **Implementation**: Client-Side React. This is the main modal where users edit their portfolios. It heavily relies on local state (`Zustand`) for immediate UI updates, and synchronization with the server (`React Query`).

---

## 2. Data Flow & State Management

Portfoliofy uses a "dual-state" approach to provide a snappy, optimistic user interface while ensuring data is safely persisted.

### The Database (Supabase)

We use a PostgreSQL database hosted on Supabase.

- The `resumes` table contains a unique `resumeData` column.
- **Crucial Concept**: `resumeData` is a **JSONB** column. Instead of creating a separate SQL table for `projects`, `education`, `workExperience`, etc., we store the _entire_ resume structure as a single JSON object. This allows us to rapidly add new sections to the app without writing complex database migrations. The shape of this JSON is strictly validated using Zod (`lib/resume.ts`).

### Local State (Zustand)

When a user opens the editor, we immediately hydrate a global Zustand store (`store/useResumeStore.ts`) with their current `resumeData`.

- As the user types or drags-and-drops items, they are modifying this _local_ Zustand state.
- This makes the UI feel instantaneous.

### Remote Sync (React Query & API Routes)

To persist the data, we use React Query (`hooks/useUserActions.ts`).

- When the user clicks "Save", we take the entire `resumeData` object from Zustand, validate it against our Zod schema, and send it to the `/api/resume` POST route.
- The API route securely overwrites the JSONB column in Supabase.

---

## 3. Core Component Patterns

### The Editor Modal (`EditProfileDialog`)

The `EditProfileDialog.tsx` is the heart of the editing experience. It manages:

1.  **The Sidebar (`ProfileSidebar.tsx`)**: Allows the user to select which tab they are editing and drag-and-drop to reorder how sections appear on their public portfolio.
2.  **The Content Area (`ProfileContent.tsx`)**: Renders the specific editing form for the currently active tab (e.g., `ProjectsTab`, `GeneralTab`).

### The List/Form Pattern (`ListTabLayout` & `useResumeList`)

Most sections in a portfolio are arrays of items (e.g., a list of Jobs, a list of Projects). We have standardized how these are built to prevent duplicated code.

- **`useResumeList`**: A custom hook that abstracts away the CRUD operations (Create, Read, Update, Delete) for any array inside the `resumeData` JSON.
- **`ListTabLayout`**: A layout component that provides a consistent UI. It shows a list of existing items (which can be dragged to reorder) on the left/top, and a form to edit the currently selected item on the right/bottom.

Whenever you need to build a new section that contains a list of items, you should _always_ use this pattern.

---

## 4. Step-by-Step Guide: Adding a New Tab

If you need to add a brand new section to the portfolio (for example, "Languages" or "Hobbies"), follow these steps:

### Step 1: Update the Schema

1. Open `lib/resume.ts`.
2. Define the schema for a single item (e.g., `LanguageSchema`). There's no shared base schema to extend — follow the existing sections (e.g. `WorkExperienceSection`, `EducationSection`) and declare `id: z.string().optional()` and `hidden: z.boolean().optional().default(false)` directly on your item schema, alongside your section-specific fields.
3. Add the array to the main `ResumeDataSchema` (e.g., `languages: z.array(LanguageSchema).optional()`).
4. Add the section key to `DEFAULT_SECTION_ORDER`.

### Step 2: Register the Tab in the Editor

1. Open `app/[username]/_components/resume/editing/EditProfileDialog.tsx`.
2. Add your new tab to the `TAB_DEFINITIONS` constant (e.g., `languages: { label: 'Languages', disabled: false }`).
3. Add your new item type to the `DeleteTarget` union and its confirmation copy to the `DELETE_DESCRIPTIONS` map.

### Step 3: Create the Tab Component

1. Create a new file: `app/[username]/_components/resume/editing/tabs/LanguagesTab.tsx`.
2. Implement the UI by composing `useResumeList` (CRUD against the store) with `useTabEditor` (list/form view state + the required-field gate that drives the global Save button), rendered through `ListTabLayout`. This is the actual shape used by `WorkExperienceTab.tsx`/`EducationTab.tsx`/`VolunteeringTab.tsx` — follow one of those directly for the full pattern (drag-reorder, hide/show, delete confirmation), condensed here:

```tsx
'use client';
import { useState } from 'react';
import { useResumeList } from '@/hooks/useResumeList';
import { useTabEditor } from '@/hooks/useTabEditor';
import { ListTabLayout } from '@/components/composite/ListTabLayout';
import { FormInput } from '@/components/ui/form-input';

const isLanguageValid = (item: any) => !!item?.languageName;

export function LanguagesTab({
  setProjectToDelete,
}: {
  setProjectToDelete: (id: string) => void;
}) {
  // storeKey must match the key added to ResumeDataSchema ('languages')
  const { items, handleSave } = useResumeList<any>('languages');
  const { view, setView, current, setCurrent } = useTabEditor<any>({
    isValid: isLanguageValid,
    onCommit: handleSave,
  });

  return (
    <ListTabLayout
      title="Languages"
      itemsLength={items.length}
      onAdd={() => {
        setCurrent({ languageName: '', fluencyLevel: '' });
        setView('form');
      }}
      renderForm={() =>
        current && (
          <div className="space-y-4">
            <FormInput
              id="languageName"
              label="Language"
              value={current.languageName}
              onChange={(val) => setCurrent({ ...current, languageName: val })}
              placeholder="e.g. English, Spanish"
            />
            <FormInput
              id="fluencyLevel"
              label="Fluency Level"
              value={current.fluencyLevel}
              onChange={(val) => setCurrent({ ...current, fluencyLevel: val })}
              placeholder="e.g. Native, Fluent, Beginner"
            />
          </div>
        )
      }
    />
  );
}
```

`view`/`items.length` also drive `ListTabLayout`'s own list rendering (with edit/delete/reorder controls) internally — see an existing tab for that part, omitted above for brevity.

### Step 4: Render the Tab Content

1. Open `app/[username]/_components/resume/editing/ProfileContent.tsx`.
2. Import your new `LanguagesTab` and render it conditionally when `activeTab === 'languages'`.

### Step 5: Update the Public View

1. Finally, you need to make sure the new data actually renders on the public profile!
2. Create a new component directly in `app/[username]/_components/resume/preview/` (e.g., `Languages.tsx`) — preview components live flat in this directory, alongside `WorkExperience.tsx`, `Writing.tsx`, etc.
3. Open `app/[username]/_components/resume/FullResume.tsx` and map your new section key to your new component inside the `SECTION_COMPONENTS` map.

---

_If you follow these patterns, your new feature will automatically support drag-and-drop reordering, hide/show toggling, and instant local state updates!_
