# Prompt Library

A modern, full-featured prompt management application built for AI power users. Organize, search, and quickly access your AI prompts with an intuitive interface and powerful organizational tools.

## 🚀 Features

### Core Functionality
- **Add/Edit/Delete Prompts** - Full CRUD operations with rich text support
- **One-Click Copy** - Instant clipboard copying with visual feedback
- **Smart Search** - Real-time search across titles, content, tags, and notes
- **Tag System** - Dynamic tagging with autocomplete and click-to-filter
- **Folder Organization** - Organize prompts into Work, Life, or All categories

### Advanced Features
- **Tag Autocomplete** - System learns and suggests previously used tags
- **Click-to-Filter Tags** - Click any tag to filter prompts instantly  
- **Folder Filtering** - Organize prompts by context (Work/Life/All)
- **Collapsible Content** - Clean card view with expandable prompt content
- **Notes & Metadata** - Add context with "Best For" field and notes
- **Responsive Design** - Works seamlessly on desktop and mobile

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **UI Components**: ShadCN UI, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS with dark/light theme support
- **Icons**: Lucide React
- **Deployment**: Vercel/Netlify ready

## 📊 Database Schema

### Prompts Table
```sql
- id: uuid (primary key)
- title: text (required)
- content: text (required)
- tags: text[] (array of tags)
- folder: text (Work/Life/All, default: All)
- best_for: text (optional - which LLMs work best)
- notes: text (optional - additional context)
- created_at: timestamptz
```

## 🎯 User Workflow

1. **Create Prompts** - Add title, content, tags, and optional metadata
2. **Organize** - Use folders (Work/Life) and tags for organization
3. **Search & Filter** - Find prompts by text search or tag/folder filtering
4. **Quick Access** - One-click copy for immediate use in AI tools
5. **Iterate** - Edit and refine prompts based on results

## 🔧 Current State (Ready for Cursor Migration)

### ✅ Working Features
- All CRUD operations functional
- Tag system with autocomplete working
- Search and filtering operational
- Folder system (All/Work/Life) functional
- Clean, responsive UI
- One-click copy with feedback
- Supabase integration stable

### 🚧 Known Issues (Ready for Cursor)
- **Missing folder creation UI** - Can't create new folders from interface
- **No drag & drop** - Cards can't be dragged between folders
- **Folder management** - Limited folder operations beyond filtering

### 🎨 UI/UX Features
- **Clean card design** with proper spacing and typography
- **Sidebar navigation** with collapsible folders and recent tags
- **Professional color scheme** with subtle shadows and borders
- **Responsive grid layout** adapting to screen size
- **Loading states** and error handling for all operations

## 📝 Component Architecture

```
app/
├── page.tsx                 # Main dashboard
├── globals.css             # Global styles
└── layout.tsx              # Root layout

components/
├── ui/                     # ShadCN UI components
├── prompt-card.tsx         # Individual prompt cards
├── prompt-form.tsx         # Add/edit prompt modal
├── prompt-grid.tsx         # Card grid layout
├── prompt-search.tsx       # Search functionality
├── tag-input.tsx           # Tag input with autocomplete
└── theme-toggle.tsx        # Dark/light mode

lib/
├── supabase.ts            # Database client
└── utils.ts               # Utility functions

types/
└── prompt.ts              # TypeScript interfaces
```

## 🎲 Usage Examples

### Typical User Journey
1. **Writer** creates prompts tagged with "writing", "blog", "email"
2. **Developer** organizes coding prompts in "Work" folder with "javascript", "react" tags
3. **Content Creator** uses search to find "marketing" prompts quickly
4. **Quick Access** - clicks tag to filter, copies prompt, pastes into Claude/ChatGPT

### Tag Strategy Examples
- **Work**: `coding`, `email`, `documentation`, `meetings`
- **Creative**: `writing`, `brainstorm`, `storytelling`, `copywriting`  
- **Learning**: `research`, `analysis`, `questions`, `study`
- **Personal**: `planning`, `journal`, `reflection`, `goals`

## 🚀 Next Phase: Cursor Migration Goals

### Day 1: Setup & Export
- [ ] Clone to local development
- [ ] Configure Cursor with .cursorrules
- [ ] Verify all functionality works locally

### Day 2-3: Production Features  
- [ ] Add folder management UI (create/rename folders)
- [ ] Implement drag & drop between folders
- [ ] Bulk operations (select multiple prompts)
- [ ] Enhanced error handling

### Day 4: Polish & Deploy
- [ ] Performance optimization
- [ ] Advanced keyboard shortcuts
- [ ] Export/import functionality
- [ ] Production deployment

## 💡 Design Philosophy

**Simplicity First** - Every feature should reduce friction in the prompt management workflow
**Power User Friendly** - Advanced features available but never in the way of basic usage
**AI-Native** - Built specifically for the AI prompt use case, not adapted from note-taking
**Fast & Responsive** - Optimized for quick access and immediate productivity

---

**Status**: MVP Complete ✅ | Ready for Cursor Migration 🚀 | Production Polish Phase 🎯
