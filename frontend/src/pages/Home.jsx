import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

export default function Home({ onLogout }) {
  const [groups, setGroups] = useState([])
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDesc, setNewGroupDesc] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/groups', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setGroups(response.data)
    } catch (err) {
      console.error('Failed to fetch groups:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGroup = async (e) => {
    e.preventDefault()
    try {
      await axios.post(
        'http://localhost:5000/api/groups',
        { name: newGroupName, description: newGroupDesc },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setNewGroupName('')
      setNewGroupDesc('')
      fetchGroups()
    } catch (err) {
      console.error('Failed to create group:', err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    onLogout()
    navigate('/login')
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>🍺 Brewski Groups</h1>
        <button className="btn-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="card">
        <h2>Create New Group</h2>
        <form onSubmit={handleCreateGroup}>
          <input
            type="text"
            placeholder="Group name"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={newGroupDesc}
            onChange={(e) => setNewGroupDesc(e.target.value)}
          />
          <button type="submit" className="btn-primary">
            Create Group
          </button>
        </form>
      </div>

      {loading ? (
        <p>Loading groups...</p>
      ) : groups.length === 0 ? (
        <p>No groups yet. Create one above!</p>
      ) : (
        <div>
          <h2>Your Groups</h2>
          {groups.map((group) => (
            <div key={group._id} className="card" style={{ cursor: 'pointer' }}>
              <h3>{group.name}</h3>
              <p>{group.description}</p>
              <p>Members: {group.members?.length || 0}</p>
              <Link to={`/group/${group._id}`}>
                <button className="btn-primary">Enter Group</button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}