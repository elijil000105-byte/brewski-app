import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import io from 'socket.io-client'

export default function GroupPage({ onLogout }) {
  const { groupId } = useParams()
  const navigate = useNavigate()
  const [group, setGroup] = useState(null)
  const [responses, setResponses] = useState([])
  const [userResponse, setUserResponse] = useState(null)
  const [selectedTime, setSelectedTime] = useState('')
  const [notifications, setNotifications] = useState([])
  const [socket, setSocket] = useState(null)
  const [newMemberUsername, setNewMemberUsername] = useState('')
  const token = localStorage.getItem('token')

  const timeSlots = ['17:00', '18:00', '19:00', '20:00', '21:00', '22:00']

  useEffect(() => {
    fetchGroup()
    fetchResponses()

    // Connect to WebSocket
    const newSocket = io('http://localhost:5000')
    newSocket.emit('join-group', groupId)
    newSocket.on('response-update', (data) => {
      addNotification(`${data.username} said ${data.response}${data.time ? ` at ${data.time}` : ''}`)
      fetchResponses()
    })
    setSocket(newSocket)

    return () => newSocket.disconnect()
  }, [groupId])

  const fetchGroup = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setGroup(response.data)
    } catch (err) {
      console.error('Failed to fetch group:', err)
    }
  }

  const fetchResponses = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/responses/${groupId}/today`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setResponses(response.data)
    } catch (err) {
      console.error('Failed to fetch responses:', err)
    }
  }

  const handleResponse = async (response) => {
    try {
      await axios.post(
        `http://localhost:5000/api/responses/${groupId}`,
        { response, time: response === 'yes' ? selectedTime : null },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setUserResponse(response)
      addNotification('Your response has been sent!')
    } catch (err) {
      console.error('Failed to submit response:', err)
    }
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    try {
      await axios.post(
        `http://localhost:5000/api/groups/${groupId}/add-member`,
        { username: newMemberUsername },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setNewMemberUsername('')
      fetchGroup()
      addNotification('Member added!')
    } catch (err) {
      console.error('Failed to add member:', err)
      addNotification(err.response?.data?.message || 'Failed to add member')
    }
  }

  const addNotification = (message) => {
    const id = Date.now()
    setNotifications((prev) => [...prev, { id, message }])
    setTimeout(() => {
      setNotifications((prev) => prev.filter((notif) => notif.id !== id))
    }, 4000)
  }

  if (!group) return <div className="container"><p>Loading group...</p></div>

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>🍺 {group.name}</h1>
        <button className="btn-danger" onClick={() => navigate('/')}>
          Back
        </button>
      </div>

      {notifications.map((notif) => (
        <div key={notif.id} className="notification">
          {notif.message}
        </div>
      ))}

      <div className="card">
        <h2>Is it a Brewski Day?</h2>
        <div style={{ marginBottom: '20px' }}>
          <button
            className={`btn-${userResponse === 'yes' ? 'success' : 'primary'}`}
            onClick={() => setUserResponse('yes')}
            style={{ marginRight: '10px' }}
          >
            ✓ Yes!
          </button>
          <button
            className={`btn-${userResponse === 'no' ? 'danger' : 'primary'}`}
            onClick={() => setUserResponse('no')}
          >
            ✗ Nix, not today
          </button>
        </div>

        {userResponse === 'yes' && (
          <div>
            <h3>Select a time:</h3>
            <div>
              {timeSlots.map((time) => (
                <button
                  key={time}
                  className={`btn-${selectedTime === time ? 'success' : 'primary'}`}
                  onClick={() => setSelectedTime(time)}
                  style={{ marginRight: '5px', marginBottom: '5px' }}
                >
                  {time}
                </button>
              ))}
            </div>
            <button className="btn-success" onClick={() => handleResponse('yes')} style={{ marginTop: '10px' }}>
              Submit ✓
            </button>
          </div>
        )}

        {userResponse === 'no' && (
          <button className="btn-danger" onClick={() => handleResponse('no')}>
            Confirm - Not today
          </button>
        )}
      </div>

      <div className="card">
        <h2>Group Status</h2>
        {responses.length === 0 ? (
          <p>Waiting for responses...</p>
        ) : (
          <ul>
            {responses.map((response) => (
              <li key={response._id}>
                <strong>{response.user.username}</strong>: {response.response === 'yes' ? `✓ Yes at ${response.time}` : '✗ Not today'}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <h2>Add Member</h2>
        <form onSubmit={handleAddMember}>
          <input
            type="text"
            placeholder="Username"
            value={newMemberUsername}
            onChange={(e) => setNewMemberUsername(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary">
            Add Member
          </button>
        </form>
      </div>

      <div className="card">
        <h2>Members ({group.members?.length || 0})</h2>
        <ul>
          {group.members?.map((member) => (
            <li key={member._id}>{member.username}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}