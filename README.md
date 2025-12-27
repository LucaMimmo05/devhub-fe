src/
├── core/                 # bootstrap & config
│   ├── App.tsx
│   ├── router.tsx
│   └── providers.tsx
│
├── layouts/              # layout globali
│   ├── AppLayout.tsx
│   └── AuthLayout.tsx
│
├── sections/             # SEZIONI DELL’APP ⭐
│   ├── auth/
│   │   ├── Login.tsx
│   │   └── LoginForm.tsx
│   │
│   ├── dashboard/
│   │   ├── Dashboard.tsx
│   │   └── widgets/
│   │       ├── TasksWidget.tsx
│   │       └── GithubWidget.tsx
│   │
│   ├── projects/
│   │   ├── Projects.tsx
│   │   └── ProjectCard.tsx
│   │
│   ├── tasks/
│   │   ├── Tasks.tsx
│   │   └── TaskItem.tsx
│   │
│   └── notes/
│       ├── Notes.tsx
│       └── NoteCard.tsx
│
├── ui/                   # design system
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   └── Badge.tsx
│
├── services/             # API layer
│   ├── api.ts
│   └── github.ts
│
├── styles/
│   └── globals.css
│
├── assets/
│   └── icons/
│
└── main.tsx
