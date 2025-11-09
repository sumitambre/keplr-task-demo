-- PostgreSQL Database Schema for Task Management System
-- Comprehensive multi-tenant admin console with role-based access

-- Enable UUID extension for primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- TENANTS TABLE (Multi-tenancy support)
-- ==========================================
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#030213',
    secondary_color VARCHAR(7) DEFAULT '#e9ebef',
    timezone VARCHAR(50) DEFAULT 'UTC',
    locale VARCHAR(10) DEFAULT 'en',
    rtl_support BOOLEAN DEFAULT false,
    status_lookup_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- LOOKUP_VALUES TABLE (Reusable enums per tenant)
-- ==========================================
CREATE TABLE lookup_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    value_key VARCHAR(100) NOT NULL,
    label VARCHAR(100) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, category, value_key)
);

-- ==========================================
-- ROLES TABLE (Role catalog per tenant)
-- ==========================================
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, name)
);

-- ==========================================
-- USERS TABLE (Admin/Staff management)
-- ==========================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    status_lookup_id UUID REFERENCES lookup_values(id),
    department VARCHAR(100),
    last_login TIMESTAMP WITH TIME ZONE,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, username),
    UNIQUE(tenant_id, email)
);

-- ==========================================
-- USER_ROLES TABLE (Many-to-many users and roles)
-- ==========================================
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_by_user_id UUID REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, role_id)
);

-- ==========================================
-- ROLE_PERMISSIONS TABLE (Fine-grained permissions)
-- ==========================================
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_key VARCHAR(150) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, permission_key)
);

-- ==========================================
-- USER_SESSIONS TABLE (Auth tokens & device tracking)
-- ==========================================
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL,
    refresh_token VARCHAR(255),
    expires_at TIMESTAMP WITH TIME ZONE,
    last_seen_at TIMESTAMP WITH TIME ZONE,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(session_token)
);

-- ==========================================
-- SKILLS TABLE (Available skills in system)
-- ==========================================
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    requires_certification BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, name)
);

-- ==========================================
-- USER_SKILLS TABLE (Many-to-many: Users and Skills)
-- ==========================================
CREATE TABLE user_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_lookup_id UUID REFERENCES lookup_values(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, skill_id)
);

-- ==========================================
-- CLIENTS TABLE (Client companies)
-- ==========================================
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    tax_id VARCHAR(50),
    billing_address TEXT,
    notes TEXT,
    status_lookup_id UUID REFERENCES lookup_values(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- CLIENT_SITES TABLE (Physical locations for clients)
-- ==========================================
CREATE TABLE client_sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    contact_person VARCHAR(255),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    site_type VARCHAR(50),
    access_instructions TEXT,
    notes TEXT,
    status_lookup_id UUID REFERENCES lookup_values(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- CLIENT_CONTACTS TABLE (Contact persons at clients)
-- ==========================================
CREATE TABLE client_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    mobile VARCHAR(20),
    department VARCHAR(100),
    is_primary BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- TASK_TYPES TABLE (Configurable task categories)
-- ==========================================
CREATE TABLE task_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    estimated_duration INTEGER,
    default_priority_lookup_id UUID REFERENCES lookup_values(id),
    icon VARCHAR(50),
    color VARCHAR(7),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, name)
);

-- ==========================================
-- TASK_TYPE_SKILLS TABLE (Required skills for task types)
-- ==========================================
CREATE TABLE task_type_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_type_id UUID NOT NULL REFERENCES task_types(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    required_level_lookup_id UUID REFERENCES lookup_values(id),
    is_mandatory BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(task_type_id, skill_id)
);

-- ==========================================
-- TASKS TABLE (Actual work tasks)
-- ==========================================
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    task_type_id UUID NOT NULL REFERENCES task_types(id),
    client_id UUID NOT NULL REFERENCES clients(id),
    site_id UUID REFERENCES client_sites(id),
    assigned_user_id UUID REFERENCES users(id),
    created_by_user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority_lookup_id UUID REFERENCES lookup_values(id),
    status_lookup_id UUID REFERENCES lookup_values(id),
    scheduled_date DATE,
    scheduled_time TIME,
    estimated_duration INTEGER,
    actual_duration INTEGER,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    internal_notes TEXT,
    location_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- TASK_COMMENTS TABLE (Communication on tasks)
-- ==========================================
CREATE TABLE task_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- ATTACHMENTS TABLE (Stored files metadata)
-- ==========================================
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    uploaded_by_user_id UUID REFERENCES users(id),
    file_name VARCHAR(255) NOT NULL,
    content_type VARCHAR(150),
    file_size INTEGER,
    storage_url TEXT NOT NULL,
    checksum TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- ATTACHMENT_LINKS TABLE (Polymorphic linking)
-- ==========================================
CREATE TABLE attachment_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attachment_id UUID NOT NULL REFERENCES attachments(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(attachment_id, entity_type, entity_id)
);
-- ==========================================
-- FINANCIAL_TRANSACTIONS TABLE (Expenses & revenue)
-- ==========================================
CREATE TABLE financial_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id),
    client_id UUID REFERENCES clients(id),
    user_id UUID NOT NULL REFERENCES users(id),
    type_lookup_id UUID REFERENCES lookup_values(id),
    category_lookup_id UUID REFERENCES lookup_values(id),
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    description TEXT NOT NULL,
    receipt_number VARCHAR(100),
    receipt_url TEXT,
    vendor_name VARCHAR(255),
    payment_method_lookup_id UUID REFERENCES lookup_values(id),
    tax_amount DECIMAL(12, 2) DEFAULT 0,
    transaction_date DATE NOT NULL,
    status_lookup_id UUID REFERENCES lookup_values(id),
    approved_by_user_id UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- COMPLAINTS TABLE (Customer complaints/feedback)
-- ==========================================
CREATE TABLE complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id),
    client_id UUID NOT NULL REFERENCES clients(id),
    reported_by VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity_lookup_id UUID REFERENCES lookup_values(id),
    category_lookup_id UUID REFERENCES lookup_values(id),
    status_lookup_id UUID REFERENCES lookup_values(id),
    assigned_to_user_id UUID REFERENCES users(id),
    resolution TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- TENANT_SETTINGS TABLE (Tenant-specific configuration)
-- ==========================================
CREATE TABLE tenant_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(20) DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, setting_key)
);

-- ==========================================
-- NOTIFICATIONS TABLE (System notifications)
-- ==========================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type_lookup_id UUID REFERENCES lookup_values(id),
    category_lookup_id UUID REFERENCES lookup_values(id),
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    metadata JSONB,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- AUDIT_LOGS TABLE (System activity tracking)
-- ==========================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- ADDITIONAL CONSTRAINTS
-- ==========================================
ALTER TABLE tenants
    ADD CONSTRAINT fk_tenants_status_lookup
    FOREIGN KEY (status_lookup_id) REFERENCES lookup_values(id);
-- ==========================================
-- INDEXES for Performance
-- ==========================================

-- Lookup values indexes
CREATE INDEX idx_lookup_values_category ON lookup_values(tenant_id, category, sort_order);

-- Roles & permissions
CREATE INDEX idx_roles_tenant_id ON roles(tenant_id);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);

-- Users indexes
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_status_lookup_id ON users(status_lookup_id);
CREATE INDEX idx_users_last_login ON users(last_login);

-- Sessions indexes
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_tenant_id ON user_sessions(tenant_id);

-- Skills indexes
CREATE INDEX idx_skills_tenant_id ON skills(tenant_id);
CREATE INDEX idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX idx_user_skills_skill_id ON user_skills(skill_id);

-- Client indexes
CREATE INDEX idx_clients_tenant_id ON clients(tenant_id);
CREATE INDEX idx_clients_status_lookup_id ON clients(status_lookup_id);
CREATE INDEX idx_client_sites_client_id ON client_sites(client_id);
CREATE INDEX idx_client_sites_status_lookup_id ON client_sites(status_lookup_id);

-- Task indexes
CREATE INDEX idx_task_types_tenant_id ON task_types(tenant_id);
CREATE INDEX idx_tasks_tenant_id ON tasks(tenant_id);
CREATE INDEX idx_tasks_assigned_user_id ON tasks(assigned_user_id);
CREATE INDEX idx_tasks_client_id ON tasks(client_id);
CREATE INDEX idx_tasks_status_lookup_id ON tasks(status_lookup_id);
CREATE INDEX idx_tasks_priority_lookup_id ON tasks(priority_lookup_id);
CREATE INDEX idx_tasks_scheduled_date ON tasks(scheduled_date);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);

-- Attachment indexes
CREATE INDEX idx_attachment_links_entity ON attachment_links(entity_type, entity_id);

-- Financial transactions indexes
CREATE INDEX idx_financial_transactions_tenant_id ON financial_transactions(tenant_id);
CREATE INDEX idx_financial_transactions_type_lookup_id ON financial_transactions(type_lookup_id);
CREATE INDEX idx_financial_transactions_status_lookup_id ON financial_transactions(status_lookup_id);
CREATE INDEX idx_financial_transactions_transaction_date ON financial_transactions(transaction_date);
CREATE INDEX idx_financial_transactions_task_id ON financial_transactions(task_id);
CREATE INDEX idx_financial_transactions_client_id ON financial_transactions(client_id);

-- Complaints indexes
CREATE INDEX idx_complaints_tenant_id ON complaints(tenant_id);
CREATE INDEX idx_complaints_client_id ON complaints(client_id);
CREATE INDEX idx_complaints_status_lookup_id ON complaints(status_lookup_id);
CREATE INDEX idx_complaints_severity_lookup_id ON complaints(severity_lookup_id);

-- Notifications indexes
CREATE INDEX idx_notifications_tenant_id ON notifications(tenant_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Audit logs indexes
CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
-- ==========================================
-- TRIGGERS for updated_at timestamps
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lookup_values_updated_at BEFORE UPDATE ON lookup_values FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_skills_updated_at BEFORE UPDATE ON skills FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_sites_updated_at BEFORE UPDATE ON client_sites FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_contacts_updated_at BEFORE UPDATE ON client_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_task_types_updated_at BEFORE UPDATE ON task_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_financial_transactions_updated_at BEFORE UPDATE ON financial_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_complaints_updated_at BEFORE UPDATE ON complaints FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tenant_settings_updated_at BEFORE UPDATE ON tenant_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- ==========================================
-- SAMPLE DATA INSERTION (for testing)
-- ==========================================

-- Sample tenant
INSERT INTO tenants (id, name, subdomain, primary_color, secondary_color, timezone, locale)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'ACME Security Solutions',
    'acme-security',
    '#030213',
    '#e9ebef',
    'America/New_York',
    'en'
);

-- Global lookup values
INSERT INTO lookup_values (id, tenant_id, category, value_key, label, sort_order) VALUES
('ad09f730-19a8-4fd9-b75a-1e9c3a5d7a10', NULL, 'tenant_status', 'active', 'Active', 1),
('2d0d422d-6752-43cb-9f5d-89f34f4a52d5', NULL, 'tenant_status', 'suspended', 'Suspended', 2),
('f021d94c-5e57-4cfb-9b0f-9777084ff2cb', NULL, 'tenant_status', 'inactive', 'Inactive', 3),
('1fe6e6e1-6f08-4f7b-9efa-112233445500', NULL, 'user_status', 'active', 'Active', 1),
('6ffb9d52-0f3b-4a3c-b069-112233445501', NULL, 'user_status', 'inactive', 'Inactive', 2),
('7cd2c8df-b0fd-4f4d-9f3f-112233445502', NULL, 'client_status', 'active', 'Active', 1),
('d97fda3f-6033-4a3f-8fe8-112233445503', NULL, 'client_status', 'inactive', 'Inactive', 2),
('f3b1d362-722d-4db9-9e7a-112233445504', NULL, 'client_site_status', 'active', 'Active', 1),
('7e98d77b-9e2f-4cd7-94c3-112233445505', NULL, 'client_site_status', 'inactive', 'Inactive', 2),
('4ff908dd-77f2-4d4e-8f1d-112233445506', NULL, 'task_priority', 'low', 'Low', 1),
('6e111c6c-02b0-4d6b-8b88-112233445507', NULL, 'task_priority', 'medium', 'Medium', 2),
('c0379d81-3ef8-4b78-9c34-112233445508', NULL, 'task_priority', 'high', 'High', 3),
('0b6bf08b-5a94-4c28-8b63-112233445509', NULL, 'task_priority', 'critical', 'Critical', 4),
('7edc0ea3-61bd-4f2a-8201-112233445510', NULL, 'task_status', 'pending', 'Pending', 1),
('33a0bfae-1398-4c9d-8fc2-112233445511', NULL, 'task_status', 'assigned', 'Assigned', 2),
('4267f7f7-50d0-4414-9bb7-112233445512', NULL, 'task_status', 'in_progress', 'In Progress', 3),
('4f9a50ce-a640-4afe-b600-112233445513', NULL, 'task_status', 'completed', 'Completed', 4),
('c4bb9c2b-7b6c-4701-8af3-112233445514', NULL, 'skill_proficiency', 'beginner', 'Beginner', 1),
('6f259c0f-63cf-4ec1-8d2e-112233445515', NULL, 'skill_proficiency', 'intermediate', 'Intermediate', 2),
('d6982b19-6da6-4f21-9d7e-112233445516', NULL, 'skill_proficiency', 'advanced', 'Advanced', 3),
('c37fbf6a-9e83-4e3f-8705-112233445517', NULL, 'skill_proficiency', 'expert', 'Expert', 4),
('b67c3312-0b7d-441d-8a43-112233445518', NULL, 'financial_type', 'income', 'Income', 1),
('a9259cca-396d-4d65-9d0d-112233445519', NULL, 'financial_type', 'expense', 'Expense', 2),
('625656d2-18fd-4ea3-80aa-112233445520', NULL, 'financial_status', 'pending', 'Pending', 1),
('261b57d0-c13b-45b0-8c9a-112233445521', NULL, 'financial_status', 'approved', 'Approved', 2),
('824a1823-50ac-4426-9c88-112233445522', NULL, 'financial_status', 'rejected', 'Rejected', 3),
('efdb43a2-2c51-4bfa-8f02-112233445523', NULL, 'financial_payment_method', 'cash', 'Cash', 1),
('4d3c8678-5c4a-427a-88c9-112233445524', NULL, 'financial_payment_method', 'card', 'Card', 2),
('1187fd31-3c91-4c06-9091-112233445525', NULL, 'financial_payment_method', 'bank_transfer', 'Bank Transfer', 3),
('c1917a91-2a5e-48c0-872d-112233445526', NULL, 'financial_category', 'travel', 'Travel', 1),
('c1917a91-2a5e-48c0-872d-112233445527', NULL, 'financial_category', 'materials', 'Materials', 2),
('4939242e-a376-4f39-8efa-112233445528', NULL, 'complaint_severity', 'low', 'Low', 1),
('dd1df238-d5f0-41f4-9526-112233445529', NULL, 'complaint_severity', 'medium', 'Medium', 2),
('35a1efd6-fbca-4a24-8c7f-112233445530', NULL, 'complaint_severity', 'high', 'High', 3),
('0cf1625d-7cc5-4c29-8d53-112233445531', NULL, 'complaint_status', 'open', 'Open', 1),
('d918ba35-02dd-4f96-8cf8-112233445532', NULL, 'complaint_status', 'in_progress', 'In Progress', 2),
('a92cf8d4-8781-4bb6-8e74-112233445533', NULL, 'complaint_status', 'resolved', 'Resolved', 3),
('2e7c53e3-ef9d-4dfd-8408-112233445534', NULL, 'complaint_category', 'service_quality', 'Service Quality', 1),
('e8a4580a-3814-4eaa-8fba-112233445535', NULL, 'notification_type', 'info', 'Info', 1),
('f2221c3e-3c58-4930-9959-112233445536', NULL, 'notification_type', 'success', 'Success', 2),
('40b11699-3fb7-456b-840d-112233445537', NULL, 'notification_type', 'warning', 'Warning', 3),
('3bb5f63a-7e7f-4a4d-8a7c-112233445538', NULL, 'notification_type', 'error', 'Error', 4),
('58b9a8b1-fc25-4eaa-8b1c-112233445539', NULL, 'notification_category', 'task_assignment', 'Task Assignment', 1);

-- Apply tenant status
UPDATE tenants
SET status_lookup_id = 'ad09f730-19a8-4fd9-b75a-1e9c3a5d7a10'
WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- Roles for tenant
INSERT INTO roles (id, tenant_id, name, description, is_system) VALUES
('b5d7d88c-79b3-4edf-8288-112233445540', '550e8400-e29b-41d4-a716-446655440000', 'Administrator', 'Full administrative access', false),
('84d9f7ef-dc76-4957-8f12-112233445541', '550e8400-e29b-41d4-a716-446655440000', 'Field Technician', 'Handles assigned tasks in the field', false);

-- Role permissions
INSERT INTO role_permissions (role_id, permission_key, description) VALUES
('b5d7d88c-79b3-4edf-8288-112233445540', 'tenants.manage', 'Manage tenant configuration'),
('b5d7d88c-79b3-4edf-8288-112233445540', 'users.manage', 'Create and update users'),
('84d9f7ef-dc76-4957-8f12-112233445541', 'tasks.execute', 'Work on assigned tasks');

-- Sample users
INSERT INTO users (id, tenant_id, username, email, password_hash, phone, status_lookup_id, department) VALUES
('f9b4f1fb-05ee-4d86-8d1e-112233445600', '550e8400-e29b-41d4-a716-446655440000', 'admin', 'admin@acme-security.com', '$2a$10$example_hash', '+1234567890', '1fe6e6e1-6f08-4f7b-9efa-112233445500', 'Management'),
('0bb5d9ab-4f92-4a39-8f55-112233445601', '550e8400-e29b-41d4-a716-446655440000', 'john.doe', 'john@acme-security.com', '$2a$10$example_hash', '+1234567891', '1fe6e6e1-6f08-4f7b-9efa-112233445500', 'Technical'),
('1646f7c4-2748-4f72-8b12-112233445602', '550e8400-e29b-41d4-a716-446655440000', 'jane.smith', 'jane@acme-security.com', '$2a$10$example_hash', '+1234567892', '1fe6e6e1-6f08-4f7b-9efa-112233445500', 'Security');

-- Assign roles
INSERT INTO user_roles (user_id, role_id, assigned_by_user_id) VALUES
('f9b4f1fb-05ee-4d86-8d1e-112233445600', 'b5d7d88c-79b3-4edf-8288-112233445540', NULL),
('0bb5d9ab-4f92-4a39-8f55-112233445601', '84d9f7ef-dc76-4957-8f12-112233445541', 'f9b4f1fb-05ee-4d86-8d1e-112233445600'),
('1646f7c4-2748-4f72-8b12-112233445602', '84d9f7ef-dc76-4957-8f12-112233445541', 'f9b4f1fb-05ee-4d86-8d1e-112233445600');

-- Sample user session
INSERT INTO user_sessions (user_id, tenant_id, session_token, refresh_token, expires_at, last_seen_at, ip_address, user_agent)
VALUES
('0bb5d9ab-4f92-4a39-8f55-112233445601', '550e8400-e29b-41d4-a716-446655440000', 'session-token-example', 'refresh-token-example', CURRENT_TIMESTAMP + INTERVAL '7 days', CURRENT_TIMESTAMP, '192.168.1.10', 'Mozilla/5.0');
-- Sample skills
INSERT INTO skills (tenant_id, name, description, requires_certification) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'CCTV Installation', 'Installation and maintenance of CCTV systems', false),
('550e8400-e29b-41d4-a716-446655440000', 'Network Configuration', 'Network setup and troubleshooting', false),
('550e8400-e29b-41d4-a716-446655440000', 'Biometric Systems', 'Installation of biometric security systems', true),
('550e8400-e29b-41d4-a716-446655440000', 'Access Control', 'Installation of door access systems', false);

-- Sample user skills
INSERT INTO user_skills (user_id, skill_id, proficiency_lookup_id) VALUES
('0bb5d9ab-4f92-4a39-8f55-112233445601', (SELECT id FROM skills WHERE name = 'CCTV Installation' LIMIT 1), '6f259c0f-63cf-4ec1-8d2e-112233445515'),
('0bb5d9ab-4f92-4a39-8f55-112233445601', (SELECT id FROM skills WHERE name = 'Network Configuration' LIMIT 1), 'd6982b19-6da6-4f21-9d7e-112233445516'),
('1646f7c4-2748-4f72-8b12-112233445602', (SELECT id FROM skills WHERE name = 'Access Control' LIMIT 1), '6f259c0f-63cf-4ec1-8d2e-112233445515');

-- Sample client
INSERT INTO clients (id, tenant_id, name, email, phone, address, city, state, postal_code, country, status_lookup_id)
VALUES (
    '48a98c39-61c8-4941-8b17-112233445610',
    '550e8400-e29b-41d4-a716-446655440000',
    'Stark Industries',
    'contact@stark-industries.com',
    '+15550001111',
    '200 Park Ave',
    'New York',
    'NY',
    '10017',
    'USA',
    '7cd2c8df-b0fd-4f4d-9f3f-112233445502'
);

-- Sample client site
INSERT INTO client_sites (id, client_id, name, address, city, state, postal_code, country, site_type, status_lookup_id)
VALUES (
    '2a1ecf95-8d26-492b-8a0d-112233445611',
    '48a98c39-61c8-4941-8b17-112233445610',
    'Stark HQ',
    '200 Park Ave',
    'New York',
    'NY',
    '10017',
    'USA',
    'office',
    'f3b1d362-722d-4db9-9e7a-112233445504'
);

-- Sample task type
INSERT INTO task_types (id, tenant_id, name, description, estimated_duration, default_priority_lookup_id, icon, color)
VALUES (
    'a3f0f7c8-3d52-4a62-8f4e-112233445612',
    '550e8400-e29b-41d4-a716-446655440000',
    'CCTV Maintenance',
    'Routine inspection and maintenance of CCTV systems',
    120,
    '6e111c6c-02b0-4d6b-8b88-112233445507',
    'camera',
    '#1A56DB'
);

-- Task type skills
INSERT INTO task_type_skills (task_type_id, skill_id, required_level_lookup_id, is_mandatory)
VALUES (
    'a3f0f7c8-3d52-4a62-8f4e-112233445612',
    (SELECT id FROM skills WHERE name = 'CCTV Installation' LIMIT 1),
    'd6982b19-6da6-4f21-9d7e-112233445516',
    true
);

-- Sample task
INSERT INTO tasks (id, tenant_id, task_type_id, client_id, site_id, assigned_user_id, created_by_user_id, title, description, priority_lookup_id, status_lookup_id, scheduled_date, scheduled_time, estimated_duration, notes)
VALUES (
    '9b9d3e92-0a7a-4d7f-8f18-112233445613',
    '550e8400-e29b-41d4-a716-446655440000',
    'a3f0f7c8-3d52-4a62-8f4e-112233445612',
    '48a98c39-61c8-4941-8b17-112233445610',
    '2a1ecf95-8d26-492b-8a0d-112233445611',
    '0bb5d9ab-4f92-4a39-8f55-112233445601',
    'f9b4f1fb-05ee-4d86-8d1e-112233445600',
    'Quarterly CCTV Maintenance',
    'Inspect and service all CCTV cameras on site',
    'c0379d81-3ef8-4b78-9c34-112233445508',
    '33a0bfae-1398-4c9d-8fc2-112233445511',
    CURRENT_DATE + INTERVAL '3 days',
    '09:00',
    120,
    'Bring replacement cables.'
);

-- Sample comment
INSERT INTO task_comments (task_id, user_id, comment, is_internal)
VALUES (
    '9b9d3e92-0a7a-4d7f-8f18-112233445613',
    '0bb5d9ab-4f92-4a39-8f55-112233445601',
    'Scheduled the maintenance for 9 AM; awaiting confirmation from client.',
    false
);

-- Sample attachments
INSERT INTO attachments (id, tenant_id, uploaded_by_user_id, file_name, content_type, file_size, storage_url)
VALUES
('a7c7a0f7-a316-4d1f-8c7f-112233445620', '550e8400-e29b-41d4-a716-446655440000', '0bb5d9ab-4f92-4a39-8f55-112233445601', 'cctv-site-photo.jpg', 'image/jpeg', 204800, 'https://cdn.example.com/uploads/cctv-site-photo.jpg'),
('6dd0a6f6-5bbd-4b1d-89f4-112233445621', '550e8400-e29b-41d4-a716-446655440000', 'f9b4f1fb-05ee-4d86-8d1e-112233445600', 'maintenance-checklist.pdf', 'application/pdf', 102400, 'https://cdn.example.com/uploads/maintenance-checklist.pdf');

INSERT INTO attachment_links (attachment_id, entity_type, entity_id, is_primary)
VALUES
('a7c7a0f7-a316-4d1f-8c7f-112233445620', 'task', '9b9d3e92-0a7a-4d7f-8f18-112233445613', true),
('6dd0a6f6-5bbd-4b1d-89f4-112233445621', 'task', '9b9d3e92-0a7a-4d7f-8f18-112233445613', false);

-- Sample financial transaction
INSERT INTO financial_transactions (
    tenant_id,
    task_id,
    client_id,
    user_id,
    type_lookup_id,
    category_lookup_id,
    amount,
    currency,
    description,
    payment_method_lookup_id,
    tax_amount,
    transaction_date,
    status_lookup_id,
    approved_by_user_id,
    approved_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    '9b9d3e92-0a7a-4d7f-8f18-112233445613',
    '48a98c39-61c8-4941-8b17-112233445610',
    '0bb5d9ab-4f92-4a39-8f55-112233445601',
    'a9259cca-396d-4d65-9d0d-112233445519',
    'c1917a91-2a5e-48c0-872d-112233445526',
    120.00,
    'USD',
    'Travel expenses for site visit',
    '4d3c8678-5c4a-427a-88c9-112233445524',
    10.00,
    CURRENT_DATE,
    '261b57d0-c13b-45b0-8c9a-112233445521',
    'f9b4f1fb-05ee-4d86-8d1e-112233445600',
    CURRENT_TIMESTAMP
);

-- Sample complaint
INSERT INTO complaints (
    tenant_id,
    task_id,
    client_id,
    reported_by,
    contact_email,
    subject,
    description,
    severity_lookup_id,
    category_lookup_id,
    status_lookup_id,
    assigned_to_user_id
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    '9b9d3e92-0a7a-4d7f-8f18-112233445613',
    '48a98c39-61c8-4941-8b17-112233445610',
    'Pepper Potts',
    'pepper@stark-industries.com',
    'Camera downtime',
    'One camera has intermittent connectivity issues.',
    'dd1df238-d5f0-41f4-9526-112233445529',
    '2e7c53e3-ef9d-4dfd-8408-112233445534',
    '0cf1625d-7cc5-4c29-8d53-112233445531',
    '1646f7c4-2748-4f72-8b12-112233445602'
);

-- Sample notification
INSERT INTO notifications (
    tenant_id,
    user_id,
    title,
    message,
    type_lookup_id,
    category_lookup_id,
    is_read,
    action_url
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    '0bb5d9ab-4f92-4a39-8f55-112233445601',
    'New task assigned',
    'You have been assigned to Quarterly CCTV Maintenance.',
    'e8a4580a-3814-4eaa-8fba-112233445535',
    '58b9a8b1-fc25-4eaa-8b1c-112233445539',
    false,
    'https://app.smsgroup.com/tasks/9b9d3e92-0a7a-4d7f-8f18-112233445613'
);
-- ==========================================
-- VIEWS for Common Queries
-- ==========================================

CREATE VIEW user_details AS
SELECT
    u.*,
    status_lookup.label AS status_label,
    COALESCE(
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'skill_name', s.name,
                'proficiency_label', prof.label
            )
        ) FILTER (WHERE s.id IS NOT NULL),
        '[]'::json
    ) AS skills
FROM users u
LEFT JOIN lookup_values status_lookup ON u.status_lookup_id = status_lookup.id
LEFT JOIN user_skills us ON u.id = us.user_id
LEFT JOIN skills s ON us.skill_id = s.id
LEFT JOIN lookup_values prof ON us.proficiency_lookup_id = prof.id
GROUP BY u.id, status_lookup.label;

CREATE VIEW task_summary AS
SELECT
    t.*,
    tt.name AS task_type_name,
    c.name AS client_name,
    cs.name AS site_name,
    cs.address AS site_address,
    assigned.username AS assigned_user,
    creator.username AS created_by_user,
    priority_lookup.label AS priority_label,
    status_lookup.label AS status_label
FROM tasks t
JOIN task_types tt ON t.task_type_id = tt.id
JOIN clients c ON t.client_id = c.id
LEFT JOIN client_sites cs ON t.site_id = cs.id
LEFT JOIN users assigned ON t.assigned_user_id = assigned.id
JOIN users creator ON t.created_by_user_id = creator.id
LEFT JOIN lookup_values priority_lookup ON t.priority_lookup_id = priority_lookup.id
LEFT JOIN lookup_values status_lookup ON t.status_lookup_id = status_lookup.id;

CREATE VIEW client_summary AS
SELECT
    c.*,
    status_lookup.label AS status_label,
    COUNT(DISTINCT cs.id) AS site_count,
    COUNT(DISTINCT cc.id) AS contact_count,
    COUNT(DISTINCT t.id) AS task_count
FROM clients c
LEFT JOIN lookup_values status_lookup ON c.status_lookup_id = status_lookup.id
LEFT JOIN client_sites cs ON c.id = cs.client_id
LEFT JOIN client_contacts cc ON c.id = cc.client_id
LEFT JOIN tasks t ON c.id = t.client_id
GROUP BY c.id, status_lookup.label;
