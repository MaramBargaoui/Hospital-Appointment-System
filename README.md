# Hospital Appointment Management System

A web-based system that allows patients to book appointments with doctors,
and lets hospital staff manage schedules, medical records, and notifications.


---

## Modules

- Authentication & User Management
- Doctor & Department Management
- Appointment Booking
- Medical Records
- Notifications
- Admin Dashboard

---

## Actors

| Actor | Role |
|-------|------|
| Patient | Books and manages appointments |
| Doctor | Views schedule, manages records |
| Receptionist | Manages bookings on behalf of patients |
| Admin | Full system control |

---

## Module Functionalities

- **Auth:** Register, login, role-based access (JWT)
- **Doctor Mgmt:** Add/edit doctors, assign specialties, manage availability
- **Appointments:** Book, cancel, reschedule, view history
- **Medical Records:** Create/view patient records per appointment
- **Notifications:** Email/SMS alerts for confirmations & reminders
- **Admin Dashboard:** Stats, reports, user management

---

## Actor Functionality Matrix

| Functionality | Patient | Doctor | Receptionist | Admin |
|---|---|---|---|---|
| Register/Login | Yes | Yes | Yes | Yes |
| Book Appointment | Yes | No | Yes | Yes |
| View/Cancel Appointment | Yes | Yes | Yes | Yes |
| Manage Doctors | No | No | No | Yes |
| Write Medical Records | No | Yes | No | Yes |
| Send Notifications | No | No | No | Yes |

---

## Key Workflows



### Appointment Booking Flow

Patient logs in → Selects specialty → Chooses doctor →
Picks date/time → Confirms → Notification sent → Doctor sees it on dashboard

![Appointment Booking Flow](./appointment_booking_workflow.jpg)

### Cancellation Flow

Patient/Receptionist cancels → System validates → Slot freed →
Notifications sent to both patient and doctor → Dashboard refreshed

![Cancellation Flow](./cancellation_workflow.png)
---

## Project Structure

```
hospital-appointment-system/
├── backend/      <- Spring Boot (Java)
├── frontend/     <- Angular
├── docs/         <- Project documentation & diagrams
└── README.md
```
