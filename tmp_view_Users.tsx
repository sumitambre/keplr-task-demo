import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import { Button } from '@repo/ui';
import { Input } from '@repo/ui';
import { Label } from '@repo/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui';
import { Badge } from '@repo/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui';
import { Edit, UserX, Plus, Briefcase, Mail, User } from 'lucide-react';
import FormBuilder from './forms/FormBuilder';
import { mockUsers } from '../../database/mockData';
import { ResponsiveCardTable } from './ResponsiveCardTable';

const availableSkills = Array.from(new Set(mockUsers.flatMap(u => u.skills)));
const availableDepartments = Array.from(new Set(mockUsers.map(u => u.dept)));

export function Users() {
	const [users, setUsers] = useState(mockUsers);
	const [availableSkillsState, setAvailableSkillsState] = useState<string[]>(availableSkills);
	const [availableDepartmentsState, setAvailableDepartmentsState] = useState<string[]>(availableDepartments);
	const [editingUser, setEditingUser] = useState<any>(null);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		username: '',
		role: 'Staff',
		dept: '',
		// now store skills as array for cleaner APIs
		skills: [] as string[],
		phone: '',
		email: '',
		status: 'Active',
	});
	// local schema matching formData (used by FormBuilder)
	const localUserSchema = {
		sections: [
			{
				key: 'root',
				title: 'User Information',
				fields: [
					{ key: 'firstName', label: 'First Name', type: 'text', required: true },
					{ key: 'lastName', label: 'Last Name', type: 'text' },
					{ key: 'username', label: 'Username', type: 'text', required: true },
					{ key: 'role', label: 'Role', type: 'select', options: [{ value: 'Admin', label: 'Admin' }, { value: 'Staff', label: 'Staff' }] },
					// use combobox backed by dataSources
					{ key: 'dept', label: 'Department', type: 'combobox', dataSourceKey: 'departments', multiple: false, helperText: 'Manage in Settings → Work Structure.' },
					{ key: 'skills', label: 'Skills', type: 'combobox', dataSourceKey: 'skills', multiple: true, helperText: 'Manage in Settings → Work Structure.' },
					{ key: 'phone', label: 'Phone', type: 'tel' },
					{ key: 'email', label: 'Email', type: 'text' },
					{ key: 'status', label: 'Status', type: 'select', options: [{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }] }
				]
			}
		]
	};

	const handleAddNewUser = () => {
		setEditingUser(null);
		// keep skills as a comma-separated string for the form UI
		setFormData({
			firstName: '',
			lastName: '',
			username: '',
			role: 'Staff',
			dept: '',
			skills: [],
			phone: '',
			email: '',
			status: 'Active',
		});
		setIsFormOpen(true);
	};

	const handleEdit = (user: any) => {
		setEditingUser(user);
		setFormData({
			firstName: user.firstName,
			lastName: user.lastName,
			username: user.username,
			role: user.role,
			dept: user.dept,
			// keep as array
			skills: user.skills || [],
			phone: user.phone,
			email: user.email,
			status: user.status,
		});
		setIsFormOpen(true);
	};

	const handleSaveUser = () => {
		// skills already maintained as array by FormBuilder combobox
		const skillsArray = Array.isArray(formData.skills) ? formData.skills : [];

		if (editingUser) {
			setUsers(users.map(u =>
				u.id === editingUser.id
					? { ...u, ...formData, skills: skillsArray }
					: u
			));
		} else {
			const newUser = {
				...formData,
				id: Math.random(),
				name: `${formData.firstName} ${formData.lastName}`,
				lastActive: new Date().toISOString().split('T')[0],
				skills: skillsArray
			};
			setUsers([...users, newUser]);
		}
		setIsFormOpen(false);
		setEditingUser(null);
	};

	const handlePasswordReset = () => {
		alert('Password has been reset to "123456"');
	};

	const getStatusBadge = (status: string) => {
		return (
			<Badge variant={status === 'Active' ? 'default' : 'secondary'}>
				{status}
			</Badge>
		);
	};

	return (
		<div className="p-6 space-y-6">
			<div className="flex justify-between items-center">
				<h1>Users</h1>
				<Button onClick={handleAddNewUser}>
					<Plus className="h-4 w-4 mr-2" />
					Add User
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>User Management</CardTitle>
				</CardHeader>
				<CardContent>
					<ResponsiveCardTable
						table={
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Name</TableHead>
										<TableHead>Username / Email</TableHead>
										<TableHead>Role</TableHead>
										<TableHead>Department</TableHead>
										<TableHead>Skills</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{users.map((user) => (
										<TableRow key={user.id}>
											<TableCell className="font-medium">{user.name}</TableCell>
											<TableCell>
												<div className="flex flex-col text-sm">
													<span className="font-medium text-foreground">@{user.username}</span>
													<span className="text-muted-foreground">{user.email}</span>
													<span className="text-muted-foreground">Last active: {user.lastActive}</span>
												</div>
											</TableCell>
											<TableCell>
												<Badge
													variant={user.role === 'Admin' ? 'destructive' : 'outline'}
													className="capitalize"
												>
													{user.role}
												</Badge>
											</TableCell>
											<TableCell>{user.dept}</TableCell>
											<TableCell>
												<div className="flex flex-wrap gap-1">
													{user.skills.map((skill) => (
														<Badge key={skill} variant="secondary" className="text-xs">
															{skill}
														</Badge>
													))}
												</div>
											</TableCell>
											<TableCell>{getStatusBadge(user.status)}</TableCell>
											<TableCell>
												<div className="flex gap-2">
													<Button
														size="sm"
														variant="outline"
														onClick={() => handleEdit(user)}
													>
														<Edit className="h-4 w-4" />
													</Button>
													<Button size="sm" variant="outline">
														<UserX className="h-4 w-4" />
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						}
						cards={users.map((user) => (
							<Card key={user.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
								<div className="flex items-start justify-between gap-3">
									<div className="min-w-0">
										<h3 className="text-lg font-semibold text-foreground">{user.name}</h3>
										<div className="mt-1 space-y-1 text-sm text-muted-foreground">
											<div className="flex items-center gap-2">
												<User className="h-4 w-4" />
												<span>@{user.username}</span>
											</div>
											<div className="flex items-center gap-2">
												<Mail className="h-4 w-4" />
												<span className="truncate">{user.email}</span>
											</div>
										</div>
									</div>
									<div className="flex flex-col items-end gap-2 shrink-0">
										<Badge
											variant={user.role === 'Admin' ? 'destructive' : 'outline'}
											className="capitalize"
										>
											{user.role}
										</Badge>
										{getStatusBadge(user.status)}
									</div>
								</div>
								<div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
									<Briefcase className="h-4 w-4" />
									<span>{user.dept}</span>
								</div>
								{user.skills.length > 0 && (
									<div className="mt-3 flex flex-wrap gap-1">
										{user.skills.map((skill) => (
											<Badge key={skill} variant="secondary" className="text-xs">
												{skill}
											</Badge>
										))}
									</div>
								)}
								<div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
									<span>Last active: {user.lastActive}</span>
								</div>
								<div className="mt-4 flex justify-end gap-2">
									<Button size="sm" variant="outline" onClick={() => handleEdit(user)}>
										<Edit className="h-4 w-4" />
									</Button>
									<Button size="sm" variant="outline">
										<UserX className="h-4 w-4" />
									</Button>
								</div>
							</Card>
						))}
						cardsClassName="space-y-4"
					/>
				</CardContent>
			</Card>

			{/* Add/Edit User Dialog */}
			<Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>
							{editingUser ? `Edit User: ${editingUser.username}` : 'Add User'}
						</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<div className="py-2">
							<FormBuilder
								schema={localUserSchema}
								value={formData as any}
								onChange={(next: any) => setFormData(next)}
								onSave={() => handleSaveUser()}
								onCancel={() => { setIsFormOpen(false); setEditingUser(null); }}
								submitLabel={editingUser ? 'Save Changes' : 'Add User'}
								dataSources={{ departments: availableDepartmentsState, skills: availableSkillsState }}
							/>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}

