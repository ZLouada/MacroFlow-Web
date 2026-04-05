"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Starting seed...');
    // Clean up existing data
    await prisma.activity.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.userPresence.deleteMany();
    await prisma.attachment.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.taskLabel.deleteMany();
    await prisma.task.deleteMany();
    await prisma.column.deleteMany();
    await prisma.label.deleteMany();
    await prisma.projectMember.deleteMany();
    await prisma.project.deleteMany();
    await prisma.workspaceMember.deleteMany();
    await prisma.scenario.deleteMany();
    await prisma.workspace.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
    console.log('Cleaned up existing data');
    // Create admin user
    const adminPassword = await bcryptjs_1.default.hash('Admin123!', 12);
    const admin = await prisma.user.create({
        data: {
            email: 'admin@macroflow.com',
            password: adminPassword,
            name: 'Admin User',
            role: 'admin',
            isEmailVerified: true,
        },
    });
    console.log('Created admin user:', admin.email);
    // Create demo users
    const userPassword = await bcryptjs_1.default.hash('User123!', 12);
    const user1 = await prisma.user.create({
        data: {
            email: 'john@example.com',
            password: userPassword,
            name: 'John Doe',
            role: 'user',
            isEmailVerified: true,
        },
    });
    const user2 = await prisma.user.create({
        data: {
            email: 'jane@example.com',
            password: userPassword,
            name: 'Jane Smith',
            role: 'user',
            isEmailVerified: true,
        },
    });
    const user3 = await prisma.user.create({
        data: {
            email: 'bob@example.com',
            password: userPassword,
            name: 'Bob Wilson',
            role: 'user',
            isEmailVerified: true,
        },
    });
    console.log('Created demo users');
    // Create workspace
    const workspace = await prisma.workspace.create({
        data: {
            name: 'MacroFlow Demo',
            slug: 'macroflow-demo',
            ownerId: admin.id,
            icon: '🚀',
            color: '#4F46E5',
        },
    });
    console.log('Created workspace:', workspace.name);
    // Add members to workspace
    await prisma.workspaceMember.createMany({
        data: [
            { workspaceId: workspace.id, userId: admin.id, role: 'owner' },
            { workspaceId: workspace.id, userId: user1.id, role: 'admin' },
            { workspaceId: workspace.id, userId: user2.id, role: 'member' },
            { workspaceId: workspace.id, userId: user3.id, role: 'member' },
        ],
    });
    console.log('Added workspace members');
    // Create labels
    const labels = await Promise.all([
        prisma.label.create({
            data: { name: 'Bug', color: '#EF4444', workspaceId: workspace.id },
        }),
        prisma.label.create({
            data: { name: 'Feature', color: '#22C55E', workspaceId: workspace.id },
        }),
        prisma.label.create({
            data: { name: 'Enhancement', color: '#3B82F6', workspaceId: workspace.id },
        }),
        prisma.label.create({
            data: { name: 'Documentation', color: '#8B5CF6', workspaceId: workspace.id },
        }),
        prisma.label.create({
            data: { name: 'Urgent', color: '#F97316', workspaceId: workspace.id },
        }),
    ]);
    console.log('Created labels');
    // Create project
    const project = await prisma.project.create({
        data: {
            name: 'Website Redesign',
            description: 'Redesign the company website with modern UI/UX',
            workspaceId: workspace.id,
            createdById: admin.id,
            status: 'active',
            color: '#6366F1',
            icon: '🎨',
        },
    });
    console.log('Created project:', project.name);
    // Add project members
    await prisma.projectMember.createMany({
        data: [
            { projectId: project.id, userId: admin.id, role: 'manager' },
            { projectId: project.id, userId: user1.id, role: 'member' },
            { projectId: project.id, userId: user2.id, role: 'member' },
        ],
    });
    console.log('Added project members');
    // Create columns
    const columns = await Promise.all([
        prisma.column.create({
            data: {
                title: 'Backlog',
                projectId: project.id,
                order: 0,
                status: 'todo',
                color: '#9CA3AF',
            },
        }),
        prisma.column.create({
            data: {
                title: 'To Do',
                projectId: project.id,
                order: 1,
                status: 'todo',
                color: '#3B82F6',
            },
        }),
        prisma.column.create({
            data: {
                title: 'In Progress',
                projectId: project.id,
                order: 2,
                status: 'inProgress',
                color: '#F59E0B',
                taskLimit: 5,
            },
        }),
        prisma.column.create({
            data: {
                title: 'Review',
                projectId: project.id,
                order: 3,
                status: 'review',
                color: '#8B5CF6',
                taskLimit: 3,
            },
        }),
        prisma.column.create({
            data: {
                title: 'Done',
                projectId: project.id,
                order: 4,
                status: 'done',
                color: '#22C55E',
            },
        }),
    ]);
    console.log('Created columns');
    // Create tasks
    const tasks = await Promise.all([
        // Backlog tasks
        prisma.task.create({
            data: {
                title: 'Research competitor websites',
                description: 'Analyze top 5 competitor websites for design inspiration',
                projectId: project.id,
                columnId: columns[0].id,
                createdBy: admin.id,
                status: 'todo',
                priority: 'low',
                order: 0,
            },
        }),
        // To Do tasks
        prisma.task.create({
            data: {
                title: 'Create wireframes',
                description: 'Design wireframes for all main pages',
                projectId: project.id,
                columnId: columns[1].id,
                createdBy: admin.id,
                assigneeId: user2.id,
                status: 'todo',
                priority: 'high',
                order: 0,
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            },
        }),
        prisma.task.create({
            data: {
                title: 'Set up development environment',
                description: 'Configure Next.js, TypeScript, and Tailwind CSS',
                projectId: project.id,
                columnId: columns[1].id,
                createdBy: user1.id,
                assigneeId: user1.id,
                status: 'todo',
                priority: 'medium',
                order: 1,
            },
        }),
        // In Progress tasks
        prisma.task.create({
            data: {
                title: 'Design homepage mockup',
                description: 'Create high-fidelity mockup for the homepage',
                projectId: project.id,
                columnId: columns[2].id,
                createdBy: admin.id,
                assigneeId: user2.id,
                status: 'inProgress',
                priority: 'high',
                order: 0,
                startDate: new Date(),
            },
        }),
        prisma.task.create({
            data: {
                title: 'Implement responsive navigation',
                description: 'Build mobile-friendly navigation component',
                projectId: project.id,
                columnId: columns[2].id,
                createdBy: user1.id,
                assigneeId: user1.id,
                status: 'inProgress',
                priority: 'medium',
                order: 1,
            },
        }),
        // Review tasks
        prisma.task.create({
            data: {
                title: 'Review color palette',
                description: 'Finalize brand colors for the new design',
                projectId: project.id,
                columnId: columns[3].id,
                createdBy: admin.id,
                assigneeId: admin.id,
                status: 'review',
                priority: 'medium',
                order: 0,
            },
        }),
        // Done tasks
        prisma.task.create({
            data: {
                title: 'Project kickoff meeting',
                description: 'Initial meeting to discuss project scope and timeline',
                projectId: project.id,
                columnId: columns[4].id,
                createdBy: admin.id,
                status: 'done',
                priority: 'high',
                order: 0,
                completedAt: new Date(),
            },
        }),
        prisma.task.create({
            data: {
                title: 'Define project requirements',
                description: 'Document all functional and technical requirements',
                projectId: project.id,
                columnId: columns[4].id,
                createdBy: admin.id,
                assigneeId: admin.id,
                status: 'done',
                priority: 'high',
                order: 1,
                completedAt: new Date(),
            },
        }),
    ]);
    console.log('Created tasks');
    // Add labels to tasks
    await prisma.taskLabel.createMany({
        data: [
            { taskId: tasks[1].id, labelId: labels[1].id }, // Feature
            { taskId: tasks[2].id, labelId: labels[1].id }, // Feature
            { taskId: tasks[3].id, labelId: labels[1].id }, // Feature
            { taskId: tasks[3].id, labelId: labels[4].id }, // Urgent
            { taskId: tasks[4].id, labelId: labels[2].id }, // Enhancement
            { taskId: tasks[5].id, labelId: labels[3].id }, // Documentation
        ],
    });
    console.log('Added labels to tasks');
    // Create comments
    await prisma.comment.createMany({
        data: [
            {
                content: 'Great progress on this! The mockup looks amazing.',
                taskId: tasks[3].id,
                userId: admin.id,
            },
            {
                content: 'I think we should also consider adding a dark mode option.',
                taskId: tasks[3].id,
                userId: user1.id,
            },
            {
                content: 'The navigation is working well on mobile now. Ready for review.',
                taskId: tasks[4].id,
                userId: user1.id,
            },
        ],
    });
    console.log('Created comments');
    // Create economic scenario
    const scenario = await prisma.scenario.create({
        data: {
            name: 'Expansionary Fiscal Policy',
            description: 'Simulation of increased government spending effects',
            userId: admin.id,
            workspaceId: workspace.id,
            fiscalPolicy: {
                governmentSpending: 500,
                taxRate: 25,
                transferPayments: 100,
            },
            monetaryPolicy: {
                interestRate: 3.5,
                moneySupply: 1000,
                reserveRequirement: 10,
            },
            externalSector: {
                exchangeRate: 1.0,
                capitalMobility: 'high',
                exchangeRegime: 'floating',
                tradeOpenness: 50,
            },
            indicators: {
                gdp: 6500,
                inflation: 2.5,
                unemployment: 5.2,
                interestRate: 3.5,
                exchangeRate: 1.0,
                tradeBalance: 50,
            },
            results: {},
        },
    });
    console.log('Created economic scenario');
    // Create activities
    await prisma.activity.createMany({
        data: [
            {
                action: 'created',
                entityType: 'project',
                entityId: project.id,
                userId: admin.id,
                workspaceId: workspace.id,
                projectId: project.id,
            },
            {
                action: 'created',
                entityType: 'task',
                entityId: tasks[0].id,
                userId: admin.id,
                workspaceId: workspace.id,
                projectId: project.id,
                taskId: tasks[0].id,
            },
            {
                action: 'updated',
                entityType: 'task',
                entityId: tasks[3].id,
                userId: user2.id,
                workspaceId: workspace.id,
                projectId: project.id,
                taskId: tasks[3].id,
                metadata: {
                    field: 'status',
                    oldValue: 'todo',
                    newValue: 'inProgress',
                },
            },
        ],
    });
    console.log('Created activities');
    // Create notifications
    await prisma.notification.createMany({
        data: [
            {
                userId: user2.id,
                type: 'taskAssigned',
                title: 'New Task Assigned',
                message: 'You have been assigned to "Create wireframes"',
                data: { taskId: tasks[1].id, projectId: project.id },
            },
            {
                userId: user1.id,
                type: 'taskAssigned',
                title: 'New Task Assigned',
                message: 'You have been assigned to "Set up development environment"',
                data: { taskId: tasks[2].id, projectId: project.id },
            },
            {
                userId: admin.id,
                type: 'commentAdded',
                title: 'New Comment',
                message: 'John Doe commented on "Design homepage mockup"',
                data: { taskId: tasks[3].id, projectId: project.id },
                read: true,
            },
        ],
    });
    console.log('Created notifications');
    console.log('Seed completed successfully!');
    console.log('\n--- Demo Credentials ---');
    console.log('Admin: admin@macroflow.com / Admin123!');
    console.log('User: john@example.com / User123!');
    console.log('User: jane@example.com / User123!');
    console.log('User: bob@example.com / User123!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map