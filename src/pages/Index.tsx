import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Users,
  Shield,
  Workflow,
  GripVertical,
  FileText,
  CheckCircle2,
  ArrowRight,
  Zap,
  Lock,
  Activity,
  Settings,
  ChevronRight,
  Github,
  Play,
  Layers,
  UserCog,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Layers className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">AgileHive</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#demo" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Demo</a>
              <a href="#technical" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Technical</a>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
                Sign In
              </Button>
              <Button size="sm" onClick={() => navigate("/login")}>
                Open Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge variant="secondary" className="mb-6 px-4 py-1.5">
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              Production-Grade Demo
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-br from-foreground via-foreground to-muted-foreground bg-clip-text">
              Manage projects with
              <span className="text-primary"> Jira-level power</span>
              <br />without the complexity.
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              A full-featured project management system with role-based access, 
              real-time workflows, and enterprise-grade architecture. 
              Built for teams that ship.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8 text-base" onClick={() => navigate("/login")}>
                <Play className="mr-2 h-5 w-5" />
                Open Live Demo
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8 text-base" asChild>
                <a href="#features">
                  View Features
                  <ChevronRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </div>
          </motion.div>

          {/* App Preview */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 relative"
          >
            <div className="relative mx-auto max-w-5xl">
              {/* Browser chrome */}
              <div className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-4 py-1 rounded-md bg-background text-xs text-muted-foreground">
                      agilehive.app/projects/board
                    </div>
                  </div>
                </div>
                
                {/* App mock */}
                <div className="p-6 bg-background">
                  <div className="flex gap-6">
                    {/* Sidebar mock */}
                    <div className="hidden md:block w-48 space-y-2">
                      <div className="h-8 rounded-md bg-primary/10 flex items-center px-3">
                        <LayoutDashboard className="w-4 h-4 text-primary mr-2" />
                        <span className="text-sm font-medium">Dashboard</span>
                      </div>
                      {["Projects", "My Tasks", "Team"].map((item) => (
                        <div key={item} className="h-8 rounded-md hover:bg-muted flex items-center px-3">
                          <span className="text-sm text-muted-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Board mock */}
                    <div className="flex-1">
                      <div className="flex gap-4 overflow-x-auto pb-4">
                        {[
                          { name: "To Do", color: "bg-status-todo", count: 4 },
                          { name: "In Progress", color: "bg-status-progress", count: 3 },
                          { name: "Review", color: "bg-status-review", count: 2 },
                          { name: "Done", color: "bg-status-done", count: 8 },
                        ].map((column) => (
                          <div key={column.name} className="flex-shrink-0 w-64">
                            <div className="flex items-center gap-2 mb-3">
                              <div className={cn("w-2 h-2 rounded-full", column.color)} />
                              <span className="text-sm font-medium">{column.name}</span>
                              <span className="text-xs text-muted-foreground">{column.count}</span>
                            </div>
                            <div className="space-y-2">
                              {Array.from({ length: Math.min(column.count, 2) }).map((_, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 0.5 + i * 0.1 }}
                                  className="p-3 rounded-lg border border-border bg-card hover:shadow-md transition-shadow cursor-pointer"
                                >
                                  <div className="flex items-start gap-2">
                                    <GripVertical className="w-4 h-4 text-muted-foreground/50 mt-0.5" />
                                    <div className="flex-1">
                                      <div className="h-3 w-3/4 rounded bg-foreground/10 mb-2" />
                                      <div className="h-2 w-1/2 rounded bg-foreground/5" />
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute -left-4 top-1/3 hidden lg:block"
              >
                <div className="p-3 rounded-lg border border-border bg-card shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-xs font-medium">Team assigned</div>
                      <div className="text-xs text-muted-foreground">3 members</div>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute -right-4 top-1/2 hidden lg:block"
              >
                <div className="p-3 rounded-lg border border-border bg-card shadow-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium">Task completed</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-y border-border bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Built like a real enterprise tool
            </p>
          </motion.div>
          
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {[
              { icon: Shield, label: "Role-Based Access", desc: "Admin & User roles" },
              { icon: Workflow, label: "Advanced Workflows", desc: "Kanban + Drag & Drop" },
              { icon: Activity, label: "Real-Time Updates", desc: "Instant sync" },
              { icon: FileText, label: "Audit Logs", desc: "Full activity tracking" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                variants={fadeInUp}
                className="text-center p-6 rounded-xl border border-border bg-card hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">{item.label}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything Jira does — structured, predictable, and scalable.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete project management toolkit with the features your team actually needs.
            </p>
          </motion.div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Large feature */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-2 p-8 rounded-2xl border border-border bg-gradient-to-br from-card to-muted/30 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-1">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <GripVertical className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Drag & Drop Kanban Board</h3>
                  <p className="text-muted-foreground mb-4">
                    Intuitive task management with smooth drag-and-drop. Move tasks between columns, 
                    reorder priorities, and visualize your workflow at a glance.
                  </p>
                  <ul className="space-y-2">
                    {["Multi-column workflows", "Priority sorting", "Quick task editing"].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-shrink-0 w-full md:w-64">
                  <div className="space-y-2">
                    {["Design Review", "API Integration", "Bug Fix"].map((task, i) => (
                      <motion.div
                        key={task}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        viewport={{ once: true }}
                        className="p-3 rounded-lg border border-border bg-background shadow-sm"
                      >
                        <span className="text-sm font-medium">{task}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Regular features */}
            {[
              {
                icon: Shield,
                title: "Role-Based Permissions",
                desc: "Control who can view, edit, or manage projects with granular role-based access control.",
              },
              {
                icon: UserCog,
                title: "Admin Controls",
                desc: "Full administrative panel for user management, role assignment, and system configuration.",
              },
              {
                icon: FileText,
                title: "Audit Logs",
                desc: "Track every action with comprehensive audit logs. Know who did what, and when.",
              },
              {
                icon: ClipboardList,
                title: "Task Workflows",
                desc: "Define custom statuses, priorities, and task types that match your team's process.",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl border border-border bg-card hover:shadow-lg transition-shadow"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Walkthrough Section */}
      <section id="demo" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4">Demo Walkthrough</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              See it in action
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the full power of the application with our interactive demo. 
              No signup required.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              {[
                {
                  step: "01",
                  title: "Login as Admin or User",
                  desc: "Choose your role and explore different permission levels.",
                },
                {
                  step: "02",
                  title: "Create & Assign Tasks",
                  desc: "Add tasks with priorities, descriptions, and assignees.",
                },
                {
                  step: "03",
                  title: "Drag & Drop Workflows",
                  desc: "Move tasks across columns to update their status.",
                },
                {
                  step: "04",
                  title: "Manage Users & Roles",
                  desc: "Admin users can manage team members and permissions.",
                },
              ].map((step, i) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    {step.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{step.title}</h3>
                    <p className="text-muted-foreground">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="p-8 rounded-2xl border border-border bg-card shadow-xl">
                <h3 className="text-xl font-bold mb-6 text-center">Choose Your Demo Account</h3>
                <div className="space-y-4">
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full p-4 rounded-xl border-2 border-primary bg-primary/5 hover:bg-primary/10 transition-colors text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                          <Shield className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                          <div className="font-semibold">Admin Account</div>
                          <div className="text-sm text-muted-foreground">Full access to all features</div>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                  
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/50 transition-colors text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <Users className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-semibold">User Account</div>
                          <div className="text-sm text-muted-foreground">Standard team member access</div>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                </div>
                
                <p className="text-center text-sm text-muted-foreground mt-6">
                  No signup required • Demo data provided
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Roles & Permissions Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4">Access Control</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Role-based permissions that make sense
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Clear separation of responsibilities between admins and team members.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl border-2 border-primary bg-primary/5"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Admin</h3>
                  <p className="text-sm text-muted-foreground">Full system access</p>
                </div>
              </div>
              <ul className="space-y-3">
                {[
                  "Create and manage all projects",
                  "Add and remove team members",
                  "Assign roles and permissions",
                  "View audit logs and activity",
                  "Configure system settings",
                  "Delete any task or project",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-8 rounded-2xl border border-border bg-card"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                  <Users className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">User</h3>
                  <p className="text-sm text-muted-foreground">Team member access</p>
                </div>
              </div>
              <ul className="space-y-3">
                {[
                  "View assigned projects",
                  "Create and manage own tasks",
                  "Update task status via drag & drop",
                  "View team member profiles",
                  "Comment and collaborate",
                  "Manage personal settings",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Technical Section */}
      <section id="technical" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4">Technical Details</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Built with production-grade architecture
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              This isn't a tutorial project. It's a fully-functional application 
              demonstrating real-world patterns.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Layers,
                title: "React + TypeScript",
                desc: "Type-safe components with modern React patterns including hooks and context.",
              },
              {
                icon: Settings,
                title: "State Management",
                desc: "Zustand for global state, React Query for server state caching.",
              },
              {
                icon: Lock,
                title: "Permission Logic",
                desc: "Real role-based access control with protected routes and UI guards.",
              },
              {
                icon: Workflow,
                title: "Real Workflows",
                desc: "Drag-and-drop powered by dnd-kit with optimistic updates.",
              },
              {
                icon: Activity,
                title: "Audit System",
                desc: "Complete activity tracking with user, action, and timestamp logs.",
              },
              {
                icon: Zap,
                title: "Modern Tooling",
                desc: "Vite, Tailwind CSS, Radix UI, and shadcn/ui components.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-xl border border-border bg-card hover:shadow-md transition-shadow"
              >
                <item.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 p-6 rounded-xl border border-border bg-card text-center"
          >
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">For recruiters & hiring managers:</span>{" "}
              This demo showcases real engineering decisions, scalable architecture, and attention to detail.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-12 rounded-3xl border border-border bg-gradient-to-br from-primary/5 via-card to-primary/5"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to explore?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Jump into the demo with pre-configured data. No signup, no credit card, 
              no hassle.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8 text-base" onClick={() => navigate("/login")}>
                <Play className="mr-2 h-5 w-5" />
                Launch Demo
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8 text-base" onClick={() => navigate("/login")}>
                <Shield className="mr-2 h-5 w-5" />
                Explore Admin Panel
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              ✓ No signup required &nbsp; ✓ Dummy data included &nbsp; ✓ Safe demo environment
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Layers className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">AgileHive</span>
            </div>
            
            <p className="text-sm text-muted-foreground text-center">
              A production-grade project management demo showcasing enterprise patterns.
            </p>
            
            <div className="flex items-center gap-4">
              <a 
                href="#demo" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Demo
              </a>
              <a 
                href="#features" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </a>
              <a 
                href="#technical" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Technical
              </a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} AgileHive. Built for demonstration purposes.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
