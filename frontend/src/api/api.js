const HOST = window.location.hostname

const API = {
    auth: `http://${HOST}:8000/api/v1`,
    db: `http://${HOST}:8001/api/v1`,
    biz: `http://${HOST}:8002/api/v1`,
}

// Lấy token từ localStorage
function getToken() { return localStorage.getItem('session') || '' }
function setToken(t) { if (t) localStorage.setItem('session', t); else localStorage.removeItem('session') }

async function apiFetch(server, path, method = 'GET', body = null) {
    const opts = {
        method,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'X-Session-Token': getToken(),   // gửi token qua header
        },
    }
    if (body) opts.body = JSON.stringify(body)

    const res = await fetch(API[server] + path, opts)
    if (res.status === 401) {
        const currentPath = window.location.pathname
        if (currentPath !== '/login' && currentPath !== '/register') {
            window.location.href = '/login'
        }
        return null
    }
    try {
        return await res.json()
    } catch {
        return null
    }
}

export const authApi = {
    login: async (account, password) => {
        const res = await apiFetch('auth', '/auth/login', 'POST', { account, password })
        if (res?.token) setToken(res.token)   // lưu token
        return res
    },
    register: (body) => apiFetch('auth', '/auth/register', 'POST', body),
    logout: async () => { setToken(null); return apiFetch('auth', '/auth/logout', 'POST') },
    changeUsername: (new_account) => apiFetch('auth', '/auth/username', 'PATCH', { new_account }),
    changePassword: (old_password, new_password) => apiFetch('auth', '/auth/password', 'PATCH', { old_password, new_password }),
}

export const dbApi = {
    getExperts: (name, skill) => apiFetch('db', `/experts${name ? `?name=${name}` : skill ? `?skill=${skill}` : ''}`),
    getExpert: (id) => apiFetch('db', `/experts/${id}`),
    getEnterprises: (name) => apiFetch('db', `/enterprises${name ? `?name=${name}` : ''}`),
    getEnterprise: (id) => apiFetch('db', `/enterprises/${id}`),
    getProfile: () => apiFetch('db', '/profile'),
    updateProfile: (body) => apiFetch('db', '/profile', 'PATCH', body),
    getProjects: (name, status) => apiFetch('db', `/projects${name ? `?name=${name}` : status ? `?status=${status}` : ''}`),
    getProject: (id) => apiFetch('db', `/projects/${id}`),
    createProject: (body) => apiFetch('db', '/projects', 'POST', body),
    getFile: (id) => apiFetch('db', `/files/${id}`),
    deleteFile: (id) => apiFetch('db', `/files/${id}`, 'DELETE'),
    createFileMeta: (body) => apiFetch('db', '/files/metadata', 'POST', body),
    deleteAccount: () => apiFetch('db', '/account', 'DELETE'),
    createFoundation: (body) => apiFetch('db', '/foundation', 'POST', body),
    createFund: (body) => apiFetch('db', '/funds', 'POST', body),
    getFunds: () => apiFetch('db', '/funds'),
    grantProject: (projectId, body) => apiFetch('db', `/projects/${projectId}/grants`, 'POST', body),
    getGrants: () => apiFetch('db', '/grants'),
    fundRequest: (projectId, body) => apiFetch('db', `/projects/${projectId}/fund-requests`, 'POST', body),
    getFundRequests: () => apiFetch('db', '/fund-requests'),
    rejectFundRequest: (requestId) => apiFetch('db', `/fund-requests/${requestId}/reject`, 'PATCH'),
}

export const bizApi = {
    contactExpert: (id, message) => apiFetch('biz', `/experts/${id}/contacts`, 'POST', { message }),
    contactEnterprise: (id, message) => apiFetch('biz', `/enterprises/${id}/contacts`, 'POST', { message }),
    invite: (projectId, body) => apiFetch('biz', `/projects/${projectId}/invitations`, 'POST', body),
    getInvitations: () => apiFetch('biz', '/invitations'),
    acceptInvitation: (id) => apiFetch('biz', `/invitations/${id}/accept`, 'POST'),
    rejectInvitation: (id) => apiFetch('biz', `/invitations/${id}/reject`, 'POST'),

    uploadImage: (formData) => fetch(
        `http://${HOST}:8002/api/v1/image/upload`,
        { method: 'POST', credentials: 'include', headers: { 'X-Session-Token': getToken() }, body: formData }
    ).then(r => r.json()),

    uploadDocument: (formData, projectId) => {
        formData.append('project_id', projectId)
        return fetch(
            `http://${HOST}:8002/api/v1/files/upload`,
            { method: 'POST', credentials: 'include', headers: { 'X-Session-Token': getToken() }, body: formData }
        ).then(r => r.json())
    },

    uploadFile: (formData, projectId) => {
        if (projectId) formData.append('project_id', projectId)
        return fetch(
            `http://${HOST}:8002/api/v1/files/upload`,
            { method: 'POST', credentials: 'include', headers: { 'X-Session-Token': getToken() }, body: formData }
        ).then(r => r.json())
    },

    acceptCallFund: (projectId) => apiFetch('biz', `/projects/${projectId}/calls/accept`, 'POST'),

    // Contacts
    getContacts: () => apiFetch('biz', '/contacts'),
    acceptContact: (id) => apiFetch('biz', `/contacts/${id}/accept`, 'PATCH'),
    rejectContact: (id) => apiFetch('biz', `/contacts/${id}/reject`, 'PATCH'),

    // Messages
    getMessages: (contactId) => apiFetch('biz', `/messages/${contactId}`),
    sendMessage: (contactId, t) => apiFetch('biz', `/messages/${contactId}`, 'POST', { text: t }),
}
