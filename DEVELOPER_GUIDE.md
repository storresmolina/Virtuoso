# Virtuoso Platform - Developer Guide

## 🎯 Project Purpose

Virtuoso is a **Learning Management System (LMS)** specifically designed for music instructors and pianists. It streamlines class management, document organization, lesson planning, and student progress tracking.

---

## 📚 Feature Overview

### 1. Student Dashboard (Instructor View)
- Monitor all enrolled students
- Track assignment completion progress
- View student status (active/inactive)
- Filter by class or status
- Quick access to individual student profiles

### 2. Documents Dashboard
- Upload sheet music and assignments
- Organize materials by type (sheet music, assignments, references, other)
- Filter documents by class and type
- Download or delete documents
- Manage class materials in one place

### 3. Notebooks
- Create and edit class planning notes
- Organize notebooks by class
- Store teaching strategies and lesson plans
- Last edited timestamp
- Easy note management

### 4. Main Dashboard
- Overview of all classes
- Quick statistics (students, classes, documents, notebooks)
- Recent class list
- One-stop shop for quick information

### 5. Settings
- Account management
- Notification preferences
- Theme selection
- Security options

---

## 🏗️ Architecture

### Component Structure
```
App (Root)
├── Router (Future: React Router)
├── Sidebar
└── Page Components
    ├── Dashboard
    ├── DocumentsDashboard
    ├── Notebooks
    ├── Students
    └── Settings
```

### Data Flow (Current: Mock Data)
```
Mock Data → Components → State (useState) → Render UI
```

### Data Flow (Future: API)
```
User Action → API Call → Backend → Database → Response → State Update → Re-render
```

---

## 🔧 Technology Choices

### Why React?
- Component-based architecture
- Large ecosystem of libraries
- Great developer tools
- Easy state management for this project size

### Why TypeScript?
- Type safety prevents runtime errors
- Better IDE support and autocomplete
- Easier refactoring
- Self-documenting code

### Why Vite?
- Lightning-fast build and reload
- Modern ES module support
- Smaller bundle size
- Better DX than Create React App

### Why CSS (No CSS Framework)?
- Full control over styling
- Smaller bundle
- Easy to maintain
- Demonstrates CSS expertise

---

## 📁 Key Files Explained

### `src/types/index.ts`
Central location for all TypeScript interfaces. Example:

```typescript
export interface Class {
  id: string;
  name: string;
  code: string;
  instructorId: string;
}
```

### `src/components/layout/Sidebar.tsx`
Main navigation component:
- Receives `activeTab` and `onTabChange` props
- Renders 5 navigation buttons
- Handles tab switching

### `src/pages/Dashboard.tsx`
Homepage showing:
- Statistics cards
- Recent classes
- Quick overview of account status

### `src/pages/DocumentsDashboard.tsx`
Document management interface:
- Upload area
- Filter system
- Document table with actions

### `src/pages/Notebooks.tsx`
Notebook editor with:
- Sidebar for notebook list
- Main editor area
- Create/delete/save functionality

### `src/pages/Students.tsx`
Student tracking with:
- Student table
- Progress bars
- Status indicators
- Filter capabilities

### `src/pages/Settings.tsx`
Settings panels with:
- Account section
- Preferences section
- Security section

---

## 🎨 Styling Approach

### Global Styles (`src/index.css`)
- Reset styles
- Base font family
- Color scheme variables
- Default element styles

### Component Styles (Individual `.css` files)
- Scoped to component
- Follows BEM naming convention (optional)
- Mobile-first responsive design

### Responsive Strategy
```css
/* Mobile first (default) */
@media (max-width: 768px) { /* tablet and up */ }
@media (max-width: 1024px) { /* laptop and up */ }
```

---

## 🔄 State Management

### Current Approach (useState)
Simple and sufficient for current needs:

```typescript
const [activeTab, setActiveTab] = useState('dashboard');
const [notebooks, setNotebooks] = useState<NotebookEntry[]>([...]);
```

### Future Considerations
As the app grows, consider:
- **Context API** for theme/user preferences
- **Redux** if state becomes complex
- **Zustand** for lightweight state management

---

## 🚀 Development Workflow

### Adding a New Feature

1. **Create Component**
   ```bash
   # Create in appropriate folder (pages/, components/)
   touch src/pages/NewFeature.tsx
   touch src/pages/NewFeature.css
   ```

2. **Add Types (if needed)**
   ```typescript
   // Add to src/types/index.ts
   export interface NewType { }
   ```

3. **Update App.tsx**
   ```typescript
   import { NewFeature } from './pages/NewFeature';
   // Add case in renderContent()
   ```

4. **Update Sidebar**
   ```typescript
   // Add to tabs array in Sidebar.tsx
   { id: 'feature', label: 'Feature', icon: '✨' }
   ```

5. **Test**
   - Run `npm run dev`
   - Test on desktop, tablet, mobile
   - Check TypeScript errors

---

## 🔐 Authentication (Future Implementation)

### Planned Structure
```
User visits app
    ↓
Check localStorage for token
    ↓
Token valid? 
    ├─ YES → Load app, show Dashboard
    └─ NO → Show Login page
         ↓
    Enter credentials
         ↓
    API call to backend
         ↓
    Token returned
         ↓
    Store in localStorage
         ↓
    Redirect to Dashboard
```

### Implementation Steps
1. Create Login page
2. Add auth context
3. Protect routes
4. Add logout functionality
5. Handle token refresh

---

## 💾 Backend Integration

### API Endpoints Needed

#### Dashboard
- `GET /api/dashboard/stats` → Statistics
- `GET /api/classes` → Recent classes

#### Documents
- `GET /api/documents` → List documents
- `POST /api/documents` → Upload document
- `DELETE /api/documents/:id` → Delete document
- `GET /api/documents/:id/download` → Download file

#### Notebooks
- `GET /api/notebooks` → List all
- `POST /api/notebooks` → Create new
- `PUT /api/notebooks/:id` → Update content
- `DELETE /api/notebooks/:id` → Delete

#### Students
- `GET /api/students` → List all
- `GET /api/students/:id` → Student details
- `PUT /api/students/:id/progress` → Update progress

#### Settings
- `GET /api/user/profile` → Get user info
- `PUT /api/user/profile` → Update profile
- `PUT /api/user/preferences` → Update preferences
- `POST /api/user/change-password` → Change password

---

## 🧪 Testing Strategy

### Unit Tests (Component level)
```typescript
// Example: test Sidebar renders correctly
test('renders all navigation tabs', () => {
  render(<Sidebar activeTab="dashboard" onTabChange={jest.fn()} />);
  expect(screen.getByText('Dashboard')).toBeInTheDocument();
});
```

### Integration Tests (Feature level)
```typescript
// Example: test Dashboard loads stats
test('Dashboard displays statistics', async () => {
  render(<App />);
  await screen.findByText('24'); // Total students
});
```

### E2E Tests (Full workflow)
```javascript
// Example: Cypress test for navigation
cy.visit('/');
cy.contains('Dashboard').click();
cy.url().should('include', '/#/dashboard');
```

---

## 📊 Performance Optimization

### Current Optimizations
- Small bundle size (Vite)
- CSS modules (if adopted)
- Component code splitting (via lazy loading)

### Future Optimizations
- Lazy load pages
- Optimize images (WebP)
- Cache API responses
- Virtual scrolling for large lists
- Service Worker for offline mode

---

## 🐛 Common Tasks

### Add a New Tab to Sidebar
1. Add to `tabs` array in `Sidebar.tsx`
2. Create new page component
3. Add case in `App.tsx` renderContent()
4. Add navigation handler

### Add Filter to a Page
1. Create filter state: `const [filter, setFilter] = useState('')`
2. Add filter UI element
3. Filter data based on state
4. Update table/list rendering

### Style a Component
1. Create `.css` file matching component name
2. Use class names following convention
3. Add media queries for responsiveness
4. Import CSS in component

---

## 📚 Resources

### Documentation
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Vite Guide](https://vitejs.dev/guide)
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid)
- [CSS Flexbox Guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox)

### Tools
- VS Code with TypeScript support
- Browser DevTools
- React Developer Tools (extension)
- Vite dev server with HMR

---

## 🎓 Learning Path

### Phase 1: Understand Current Structure
1. Read `README.md`
2. Review `ARCHITECTURE.md`
3. Explore `FEATURES.md`
4. Examine `src/types/index.ts`

### Phase 2: Modify Existing Code
1. Update Dashboard statistics
2. Add new student to Students page
3. Create new notebook entry
4. Change color scheme

### Phase 3: Add Features
1. Implement real form validation
2. Add delete confirmation modals
3. Create a new page
4. Implement search functionality

### Phase 4: Backend Integration
1. Set up Express server
2. Create database schema
3. Build API endpoints
4. Connect frontend to API

### Phase 5: Advanced Features
1. User authentication
2. File upload/storage
3. Real-time updates
4. Mobile app

---

## ✅ Best Practices

### Code Organization
- One component per file
- Related files in same folder
- Consistent naming conventions
- Clear folder structure

### TypeScript
- Always define types
- Avoid `any` type
- Use strict mode
- Export interfaces

### Styling
- Mobile-first CSS
- Semantic class names
- DRY principles
- Consistent spacing

### Performance
- Lazy load when possible
- Minimize re-renders
- Cache expensive computations
- Optimize assets

### Accessibility
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation
- Color contrast ratios

---

## 🤝 Contributing Guidelines

1. **Create a branch** for your feature
2. **Write clean code** with comments
3. **Add TypeScript types** for all data
4. **Test responsiveness** on all breakpoints
5. **Update documentation** if needed
6. **Submit pull request** with description

---

## 📞 Support

For questions or issues:
1. Check existing documentation
2. Review similar components
3. Check TypeScript errors
4. Test in browser DevTools

---

**Virtuoso Development Guide Complete** ✅

You now have everything needed to:
- ✅ Understand the current architecture
- ✅ Add new features
- ✅ Style components
- ✅ Integrate with backend
- ✅ Deploy to production

Happy coding! 🎵
