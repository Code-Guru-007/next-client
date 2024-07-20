import React, { useEffect, useState } from 'react'

import { useRouter } from 'next/router'
import useOrgCalendars from "utils/useOrgCalendars";

const GoogleCalendarOauth = () => {
  const { query, replace } = useRouter()
  const [message, setMessage] = useState("")
  const organizationId = window.localStorage.getItem("calendarOAuthOrgId")
  useOrgCalendars(
    {
      organizationId,
    },
    {
      code: query.code
    },
    {
      onSuccess: () => {
        replace("/me/calendar");
      },
      onError: (err) => {
        setMessage(err.response.statusText)
      }
    },
    !query.code
  );

  useEffect(() => {
    if (!query.code) {
      setMessage("No code provided")
    } else {
      setMessage("Redirecting...")
    }
  }, [query.code])

  return (
    <div>{message}</div>
  )
}

export default GoogleCalendarOauth