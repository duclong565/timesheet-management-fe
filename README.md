# 🕐 Timesheet Management Frontend

A modern, enterprise-grade timesheet management frontend application built with **Next.js 14** and **TypeScript**. This application provides a comprehensive solution for tracking work hours, managing projects, and handling employee requests with role-based access control.

## 🚀 **Features**

### **Core Functionality**
- **📊 Personal Dashboard** - Real-time metrics and analytics
- **⏱️ Timesheet Management** - Track work hours with project/task assignment
- **📋 Request Management** - Leave requests, remote work, and overtime
- **👥 User Management** - Employee profiles and role management
- **📈 Project Management** - Project tracking and team assignment
- **🔍 Advanced Reporting** - Comprehensive analytics and insights

### **Technical Features**
- **🔐 JWT Authentication** - Secure token-based authentication
- **🌐 Google OAuth Integration** - Social login capability
- **👮 Role-Based Access Control** - Fine-grained permissions (USER, PM, HR, ADMIN)
- **🎨 Dark/Light Theme** - Responsive design with theme switching
- **📱 Mobile Responsive** - Progressive web app capabilities
- **🔄 Real-time Updates** - Live data synchronization
- **🌍 Internationalization** - Multi-language support ready

## 🛠️ **Tech Stack**

### **Frontend Framework**
- **Next.js 14** - React framework with App Router
- **TypeScript** - Static type checking
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - High-quality component library

### **State Management**
- **TanStack Query** - Server state management
- **Zustand** - Client state management
- **React Hook Form** - Form state management
- **React Context** - Authentication context

### **Authentication & Security**
- **JWT Tokens** - Secure authentication
- **Role-based permissions** - Access control
- **Input validation** - Zod schema validation
- **XSS protection** - Security best practices

### **Development Tools**
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type safety
- **Jest** - Unit testing
- **Playwright** - E2E testing
- **Storybook** - Component development

## 📁 **Project Structure**

```
timesheet-management-fe/
├── public/                          # Static assets
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (auth)/                # Authentication pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/           # Main application
│   │   │   ├── dashboard/
│   │   │   ├── timesheets/
│   │   │   ├── projects/
│   │   │   ├── requests/
│   │   │   ├── users/
│   │   │   └── settings/
│   │   ├── layout.tsx             # Root layout
│   │   └── page.tsx               # Landing page
│   ├── components/                 # Reusable components
│   │   ├── ui/                    # UI primitives
│   │   ├── forms/                 # Form components
│   │   ├── layout/                # Layout components
│   │   └── features/              # Feature components
│   ├── contexts/                   # React contexts
│   ├── hooks/                      # Custom hooks
│   ├── lib/                        # Utility libraries
│   ├── types/                      # TypeScript types
│   └── config/                     # Configuration
├── .env.local                      # Environment variables
├── next.config.js                  # Next.js configuration
├── tailwind.config.js              # Tailwind configuration
├── tsconfig.json                   # TypeScript configuration
└── package.json                    # Dependencies
```

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18.0.0 or later
- npm 8.0.0 or later
- Backend API running (see backend README)

### **Installation**

1. **Clone the repository**
```bash
git clone <repository-url>
cd timesheet-management-fe
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/time-management
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXTAUTH_SECRET=your-nextauth-secret
```

4. **Start development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

### **Build for Production**
```bash
npm run build
npm run start
```

## 🔐 **Authentication System**

### **Login Flow**
1. User enters credentials or uses Google OAuth
2. JWT token received and stored securely
3. Token automatically included in API requests
4. Role-based navigation and permissions applied

### **Role-Based Access Control**
- **USER** - Personal timesheets, requests, and profile
- **PM** - Project management and team oversight
- **HR** - User management and approval workflows
- **ADMIN** - Full system access and configuration

### **Protected Routes**
```typescript
// Example: Protect a component with role-based access
const UserManagement = withAuth(UsersList, ['ADMIN', 'HR'])

// Example: Check permissions in components
const { checkPermission } = useAuth()
if (checkPermission(['ADMIN', 'HR'])) {
  // Render admin/HR content
}
```

## 🎨 **UI/UX Design System**

### **Design Principles**
- **Accessibility First** - WCAG 2.1 compliant
- **Mobile Responsive** - Works on all devices
- **Consistent Spacing** - 8px grid system
- **Semantic Colors** - Meaningful color usage
- **Clear Typography** - Readable and scalable

### **Component Library**
Built with Radix UI primitives and custom styling:

```typescript
// Example: Using the design system
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

<Card className="p-6">
  <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
  <Button variant="primary" size="lg">
    Create Timesheet
  </Button>
</Card>
```

### **Theme System**
```typescript
// Dark/Light mode support
import { useTheme } from 'next-themes'

const { theme, setTheme } = useTheme()
setTheme('dark') // or 'light'
```

## 📊 **State Management**

### **Server State (TanStack Query)**
```typescript
// Example: Fetching timesheets with caching
const { data: timesheets, isLoading, error } = useQuery({
  queryKey: ['timesheets', filters],
  queryFn: () => apiClient.getTimesheets(filters),
  staleTime: 5 * 60 * 1000, // 5 minutes
})
```

### **Client State (Zustand)**
```typescript
// Example: Global UI state
const useUIStore = create((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))
```

### **Form State (React Hook Form)**
```typescript
// Example: Form with validation
const form = useForm<CreateTimesheetDto>({
  resolver: zodResolver(createTimesheetSchema),
  defaultValues: {
    date: new Date().toISOString().split('T')[0],
    workingTime: 8,
    type: 'NORMAL',
  },
})
```

## 🌐 **API Integration**

### **Type-Safe API Client**
```typescript
// Example: API client usage
import { apiClient } from '@/lib/api-client'

// Create timesheet
const timesheet = await apiClient.createTimesheet({
  date: '2024-01-15',
  workingTime: 8,
  type: 'NORMAL',
  projectId: 'project-id',
})

// Get paginated timesheets
const { data, pagination } = await apiClient.getTimesheets({
  page: 1,
  limit: 10,
  status: 'PENDING',
})
```

### **Error Handling**
```typescript
// Example: Error handling
import { ApiError } from '@/lib/api-client'

try {
  await apiClient.createTimesheet(data)
} catch (error) {
  if (error instanceof ApiError) {
    if (error.isValidationError) {
      // Handle validation errors
    } else if (error.isAuthError) {
      // Handle authentication errors
    }
  }
}
```

## 📱 **Responsive Design**

### **Mobile-First Approach**
```typescript
// Example: Responsive components
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card className="p-4 md:p-6">
    <h3 className="text-lg md:text-xl font-semibold">
      Mobile-friendly Card
    </h3>
  </Card>
</div>
```

### **Breakpoints**
- **sm**: 640px (Small devices)
- **md**: 768px (Medium devices)
- **lg**: 1024px (Large devices)
- **xl**: 1280px (Extra large devices)
- **2xl**: 1536px (2X large devices)

## 🧪 **Testing**

### **Unit Tests**
```bash
# Run unit tests
npm run test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### **E2E Tests**
```bash
# Run Playwright tests
npm run test:e2e
```

### **Component Testing**
```bash
# Start Storybook
npm run storybook
```

## 🔧 **Development Scripts**

```bash
# Development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
npm run format:check

# Build for production
npm run build
npm run start
```

## 📦 **Deployment**

### **Environment Variables**
```env
# Production environment
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/time-management
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-production-google-client-id
NEXTAUTH_SECRET=your-production-secret
```

### **Build Process**
```bash
# Build application
npm run build

# Start production server
npm run start
```

### **Docker Deployment**
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

## 📈 **Performance Optimization**

### **Code Splitting**
- Route-based code splitting with Next.js
- Component-based lazy loading
- Dynamic imports for heavy components

### **Caching Strategy**
- TanStack Query for API caching
- Next.js built-in caching
- Browser caching for static assets

### **Bundle Optimization**
- Tree shaking for unused code
- Image optimization with Next.js Image
- Font optimization with Next.js fonts

## 🛡️ **Security Best Practices**

### **Authentication Security**
- JWT tokens with appropriate expiration
- Secure token storage
- Automatic token refresh
- Logout on token expiration

### **Input Validation**
- Zod schema validation
- XSS prevention
- CSRF protection
- Input sanitization

### **Access Control**
- Role-based permissions
- Route protection
- Component-level security
- API access control

## 🎯 **Best Practices**

### **Code Organization**
- Feature-based folder structure
- Reusable component library
- Custom hooks for business logic
- Proper TypeScript usage

### **Component Design**
- Single responsibility principle
- Composition over inheritance
- Props interface definition
- Default props handling

### **Performance**
- React.memo for expensive components
- useMemo for expensive calculations
- useCallback for function props
- Lazy loading for routes

## 🔮 **Future Enhancements**

### **Planned Features**
- Real-time notifications (WebSocket)
- Advanced reporting dashboard
- Mobile app development
- PWA capabilities
- Offline support

### **Technical Improvements**
- GraphQL integration
- Micro-frontend architecture
- Advanced caching strategies
- Enhanced accessibility features

## 🐛 **Troubleshooting**

### **Common Issues**

1. **API Connection Issues**
   - Check `NEXT_PUBLIC_API_URL` in `.env.local`
   - Ensure backend server is running
   - Verify CORS settings

2. **Authentication Issues**
   - Clear browser localStorage
   - Check JWT token expiration
   - Verify Google OAuth configuration

3. **Build Issues**
   - Clear Next.js cache: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npm run type-check`

## 📚 **Documentation**

- [Architecture Documentation](./ARCHITECTURE.md)
- [Component Library](./docs/components.md)
- [API Documentation](./docs/api.md)
- [Deployment Guide](./docs/deployment.md)

## 🤝 **Contributing**

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Radix UI](https://www.radix-ui.com/) - UI primitives
- [Shadcn/UI](https://ui.shadcn.com/) - Component library
- [TanStack Query](https://tanstack.com/query/) - Data fetching

---

**Built with ❤️ by the Development Team**
