# USTU CAMPUS - INTEGRATED CAMPUS MANAGEMENT SYSTEM

## COMPREHENSIVE MINI PROJECT REPORT

---

## TITLE PAGE

**Submitted in partial fulfillment of the requirements of the degree**

# BACHELOR OF TECHNOLOGY IN COMPUTER SCIENCE AND ENGINEERING

**By**

**Aarush** (Team Leader)  
**Amisa**  
**Kritika**  
**Aayush**

---

**Supervisor**  
**Prof. Sandeep Dubey**

**Department of Computer Science & Engineering**

**UNIVERSAL SKILLTECH UNIVERSITY, VASAI (E)**

**Academic Year 2025-26 (Semester IV)**

---

## CERTIFICATE

Vidya Vikas Education Trust's  
Universal Skilltech University, Vasai (E)  
Department of Computer Science & Engineering

---

**CERTIFICATE**

This is to certify that the mini project entitled **"USTU CAMPUS - Integrated Campus Management Platform"** is a bonafide work carried out by **Aarush, Amisa, Kritika, and Aayush** in partial fulfillment of the requirements for the Mini Project (Semester IV) of the Second Year Bachelor of Technology in Computer Science and Engineering program at Universal Skilltech University, Vasai, Mumbai, during the academic year 2025–2026 (Semester IV).

---

**(Prof. Sandeep Dubey)**  
Supervisor & SE Coordinator

**(Dr. R. Kamatchi)**  
Pro-Vice Chancellor

---

## MINI PROJECT APPROVAL

**This is to certify that the Mini Project entitled**

**"USTU CAMPUS - Integrated Campus Management Platform"**

**submitted by**

**Aarush (Team Leader), Amisa, Kritika, and Aayush**

**has been examined and approved for the award of the degree of Bachelor of Technology in Computer Science and Engineering.**

---

### **Examiners:**

**1.** ___________________________  
(Internal Examiner Name & Sign)

**2.** ___________________________  
(External Examiner Name & Sign)

**Date:** _____________  
**Place:** _____________

---

## TABLE OF CONTENTS

| Item | Page No. |
|------|----------|
| Abstract | ii |
| Acknowledgments | iii |
| List of Abbreviations | iv |
| List of Figures | v |
| List of Tables | vi |
| List of Symbols | vii |
| Chapter 1: Introduction | 1 |
| Chapter 2: Literature Survey | 8 |
| Chapter 3: Proposed System | 15 |
| Chapter 4: Conclusion & Future Scope | 30 |
| Appendix | 32 |
| References | 38 |

---

## ABSTRACT

Modern educational institutions face significant challenges in managing diverse operational activities through fragmented systems. Departments operate in silos, utilizing separate platforms for attendance tracking, academic resource distribution, grade management, and institutional communication. This fragmentation creates inefficiencies, reduces accessibility, and hinders effective collaboration between students, faculty, and administrative personnel.

The USTU Campus platform presents a comprehensive, unified web-based solution designed to consolidate all campus operations into a single, integrated ecosystem. This full-stack application leverages contemporary web technologies including React with TypeScript for dynamic user interfaces, Supabase for robust database management, and Clerk for secure authentication protocols. The system accommodates multiple user roles—students, teachers, administrators, and canteen staff—each with customized dashboards and feature sets aligned with their specific operational requirements.

Key functionalities encompassing the platform include real-time attendance monitoring, comprehensive grade and performance tracking, dynamic resource and assignment management, integrated notice distribution, scheduling optimization, library resource coordination, and operational canteen management. The application implements role-based access control to ensure data security and appropriate permission hierarchies. With deployment on Vercel and powered by PostgreSQL databases, the system demonstrates scalability, reliability, and professional-grade performance suitable for institutional deployment.

The platform significantly improves operational efficiency by eliminating redundant processes, providing centralized data management, enabling seamless inter-departmental communication, and delivering an intuitive user experience across diverse user populations. This report presents the comprehensive system design, architectural decisions, implementation methodology, and technical specifications underpinning the USTU Campus platform.

**Keywords:** Campus Management System, Role-Based Access Control, Full-Stack Web Application, React, Supabase, Integrated Platform, Educational Technology

---

## ACKNOWLEDGMENTS

We express our heartfelt gratitude to **Prof. Sandeep Dubey** for his invaluable guidance, continuous encouragement, and exceptional mentorship throughout the development of this project. His expertise, constructive feedback, and unwavering support have been instrumental in helping us accomplish our objectives within the stipulated timeframe.

We extend our sincere appreciation to **Dr. Jitendra Saturwar**, Head of the Department of Computer Science and Engineering, for providing an intellectually stimulating environment, fostering innovation, and extending departmental resources that facilitated our work.

We would like to acknowledge **Dr. J. B. Patil**, Principal, and the entire management of Universal Skilltech University for providing comprehensive facilities, technical infrastructure, laboratory access, and an academically conducive atmosphere that enabled us to execute our project successfully.

We are grateful to the departmental faculty, laboratory assistants, library staff, and all administrative personnel who provided timely assistance and support throughout our project duration. Their collaborative approach and readiness to help contributed significantly to our success.

Finally, we appreciate our peers and colleagues whose constructive discussions and technical insights enhanced the quality of our work.

**Team Members:**

**Aarush (Roll No.: ______)**  
Team Leader

**Amisa (Roll No.: ______)**  
Team Member

**Kritika (Roll No.: ______)**  
Team Member

**Aayush (Roll No.: ______)**  
Team Member

---

## LIST OF ABBREVIATIONS

| Abbreviation | Full Form |
|--------------|-----------|
| CSE | Computer Science and Engineering |
| B.Tech | Bachelor of Technology |
| HTTP | Hypertext Transfer Protocol |
| HTTPS | Hypertext Transfer Protocol Secure |
| REST | Representational State Transfer |
| CRUD | Create, Read, Update, Delete |
| UI | User Interface |
| UX | User Experience |
| MVC | Model-View-Controller |
| RLS | Row Level Security |
| JWT | JSON Web Token |
| API | Application Programming Interface |
| JSON | JavaScript Object Notation |
| HTML | Hypertext Markup Language |
| CSS | Cascading Style Sheets |
| JavaScript | Programming Language for Web |
| TypeScript | Superset of JavaScript with Type Definitions |
| SQL | Structured Query Language |
| PostgreSQL | Advanced Open-Source Relational Database |
| IDE | Integrated Development Environment |
| CDN | Content Delivery Network |
| RBAC | Role-Based Access Control |
| JWT | JSON Web Token |
| CORS | Cross-Origin Resource Sharing |
| DOM | Document Object Model |
| NPM | Node Package Manager |
| Git | Version Control System |
| GitHub | Web-Based Repository Hosting |
| Vite | Modern Frontend Build Tool |
| React | JavaScript Library for UI Development |
| Redux | State Management Library |
| Middleware | Intermediary Software Layer |
| Deployment | Process of Releasing Application to Production |

---

## LIST OF FIGURES

| Sr. No. | Figure Title | Page No. |
|---------|-------------|----------|
| 2.1 | Comparative Analysis of Existing Campus Management Platforms | 12 |
| 3.1 | USTU Campus System Architecture Overview | 18 |
| 3.2 | System Architecture Detailed Diagram | 19 |
| 3.3 | Student Module Workflow | 20 |
| 3.4 | Teacher Dashboard Interface Structure | 21 |
| 3.5 | Administrative Control Panel Layout | 22 |
| 3.6 | Canteen Management Module Organization | 23 |
| 3.7 | Complete Process Flow Diagram | 24 |
| 3.8 | Database Schema Representation | 25 |
| 3.9 | Authentication & Authorization Flow | 26 |
| 3.10 | User Role Hierarchy Diagram | 27 |

---

## LIST OF TABLES

| Sr. No. | Table Title | Page No. |
|---------|------------|----------|
| 2.1 | Literature Survey: Existing Campus Management Systems | 9-11 |
| 3.1 | Hardware Requirements Specification | 28 |
| 3.2 | Software Requirements and Dependencies | 29 |
| 3.3 | Technology Stack Summary | 29 |
| 3.4 | API Endpoints Specification | 30 |
| 4.1 | Comparison: Proposed System vs. Existing Solutions | 31 |

---

## LIST OF SYMBOLS

| Symbol | Meaning |
|--------|---------|
| → | Directed Flow |
| ⇔ | Bidirectional Communication |
| ◊ | Decision Point |
| ▭ | Process Box |
| ○ | Terminator |
| = | Assignment Operator |
| ≥ | Greater Than or Equal To |
| ≤ | Less Than or Equal To |
| ≠ | Not Equal To |
| ∈ | Element Of |
| ⊆ | Subset Of |
| ≈ | Approximately Equal |
| ∞ | Infinity |

---

# CHAPTER 1: INTRODUCTION

## 1.1 Introduction to the Domain

Educational institutions represent complex organizational ecosystems comprising thousands of students, hundreds of faculty members, and administrative departments performing interrelated functions. Traditional administrative approaches relying on fragmented systems, paper-based documentation, and disparate software solutions have proven increasingly inadequate for meeting contemporary institutional demands.

The educational landscape has undergone revolutionary transformation through technological advancement. Universities and colleges now recognize that competitive advantage derives from operational efficiency, enhanced student experience, and streamlined administrative processes. This recognition has catalyzed demand for integrated digital solutions that consolidate institutional operations into cohesive, user-friendly platforms.

Campus management systems emerge as critical infrastructure addressing this organizational need. These platforms transcend simple information repositories, functioning instead as central nervous systems coordinating academic operations, student services, resource allocation, and institutional communication. Effective campus management systems reduce administrative overhead, improve information accessibility, enhance inter-departmental collaboration, and create superior user experiences for all stakeholders.

## 1.2 Motivation

Multiple compelling factors motivated the development of USTU Campus:

### Academic Inefficiency
Current institutional practices scatter critical information across multiple, disconnected platforms. Students navigate different interfaces for attendance tracking, grade checking, assignment submission, and resource access. Faculty members maintain separate systems for classroom management, evaluation, and communication. This fragmentation generates frustration, reduces productivity, and creates unnecessary administrative burden.

### Communication Breakdown
Institutional announcements, schedule modifications, and critical notices currently reach stakeholders through inconsistent channels—emails, bulletin boards, verbal announcements—resulting in information loss and widespread miscommunication.

### Resource Accessibility
Students struggle to identify available learning materials, institutional resources, and support services due to scattered documentation and limited discoverability mechanisms. Faculty encounter barriers when attempting to distribute teaching resources efficiently.

### Administrative Overhead
Current systems require redundant data entry, multiple security authentications, and parallel documentation maintenance, diverting institutional resources from core educational functions.

### Operational Complexity
The absence of centralized coordination creates inefficiencies in attendance tracking accuracy, grade compilation, schedule management, and resource utilization across multiple departments.

## 1.3 Problem Statement

The current operational environment of educational institutions faces the following critical challenges:

**Primary Problem:** Absence of an integrated platform causing information fragmentation, operational inefficiency, limited inter-departmental collaboration, and suboptimal user experience across student, faculty, and administrative populations.

**Specific Deficiencies:**
- Multiple disconnected systems requiring separate logins and interface navigation
- Delayed information dissemination regarding institutional updates and schedule changes
- Inefficient resource discovery and distribution mechanisms
- Manual, error-prone administrative processes
- Lack of real-time data synchronization across departments
- Limited analytics capabilities for institutional decision-making
- Inadequate mobile accessibility
- Insufficient role-based access control mechanisms

## 1.4 Objectives

The USTU Campus project addresses these challenges through the following primary objectives:

### Primary Objectives

1. **Develop Unified Platform:** Create a comprehensive, single-access web application consolidating all campus operations, eliminating the necessity for multiple system logins and interface switching.

2. **Implement Role-Based Architecture:** Design role-specific dashboards and feature sets for students, teachers, administrators, and canteen staff, ensuring each user population accesses relevant functionalities appropriate to their institutional responsibilities.

3. **Enable Real-Time Communication:** Establish mechanisms for instantaneous notice distribution, schedule updates, and critical announcements reaching all stakeholders simultaneously.

4. **Centralize Data Management:** Establish a unified database architecture ensuring data consistency, eliminating redundancy, and enabling informed institutional decision-making through comprehensive analytics.

5. **Enhance User Experience:** Design intuitive, responsive interfaces adhering to contemporary web standards and accessibility principles, accommodating diverse user technical proficiencies.

### Secondary Objectives

6. **Implement Robust Security:** Deploy authentication mechanisms (Clerk), authorization protocols (RBAC), and encryption standards protecting sensitive institutional and personal data.

7. **Ensure Scalability:** Develop architecture supporting future institutional growth, additional features, and expanded user populations without performance degradation.

8. **Improve Operational Efficiency:** Automate repetitive administrative processes, reduce manual data entry, and streamline workflows across institutional departments.

9. **Facilitate Data-Driven Decision Making:** Generate comprehensive reports and analytics enabling administrators to monitor institutional operations and identify improvement opportunities.

10. **Establish Accessibility Standards:** Ensure application compliance with accessibility guidelines, accommodating users with diverse technical capabilities and accessibility requirements.

---

# CHAPTER 2: LITERATURE SURVEY

## 2.1 Survey of Existing Systems

### Overview of Current Campus Management Landscape

Contemporary educational institutions employ various approaches to campus management. This section analyzes leading existing systems, identifying their capabilities, limitations, and architectural decisions.

### 2.1.1 Traditional Enterprise Systems

**ERP (Enterprise Resource Planning) Solutions**

Institutions like Oracle NetSuite and SAP implement comprehensive ERP systems managing financial operations, human resources, procurement, and basic academic functions. These monolithic systems provide robust data management and institutional-wide integration but suffer from:
- Steep implementation costs and lengthy deployment timelines
- Steep learning curves requiring extensive user training
- Limited customization capabilities for educational-specific workflows
- Cumbersome user interfaces not optimized for student/faculty workflows
- Expensive licensing models based on user counts
- Lack of modern mobile-first design principles

### 2.1.2 Cloud-Based Collaborative Platforms

**Microsoft Teams and Google Workspace Integration Approaches**

Institutions increasingly layer educational functionalities onto commercial collaboration platforms. While these provide communication infrastructure, they present significant limitations:
- Fragmented academic workflows across multiple disconnected services
- Insufficient specialization for campus-specific requirements
- Limited role-based customization for diverse institutional stakeholder populations
- Incomplete attendance, grading, and resource management capabilities
- Inadequate mobile experience for primary academic functions

### 2.1.3 Purpose-Built Learning Management Systems

**Canvas, Blackboard, Moodle Ecosystems**

Learning management systems dominate educational technology landscapes, offering:
- Established adoption across higher education institutions
- Comprehensive course management and assessment tools
- Integration with institutional authentication systems

However, they present critical gaps:
- Scope limited to academic delivery, excluding administrative operations
- Attendance tracking, grade distribution exist as isolated components
- Resource discovery mechanisms insufficient for institutional needs
- Student experience fragmented across LMS and separate administrative systems
- Expensive enterprise licensing
- Limited customization without substantial developer resources

### 2.1.4 Emerging Cloud-Native Platforms

**Modern SaaS Campus Solutions**

Recent entrants including Anthology (Blackboard evolution) and custom cloud platforms provide improved user experiences but commonly exhibit:
- Incomplete feature coverage across all institutional operations
- Expensive per-user subscription models
- Limited institutional customization
- Vendor lock-in concerns
- Inadequate data ownership and privacy protections

## 2.2 Limitations of Existing Systems and Research Gap

### Identified Gaps in Current Solutions

**1. Fragmentation Problem**
Existing systems rarely consolidate all campus operations into unified platforms. Students and faculty navigate multiple interfaces, authenticate repeatedly, and struggle with information silos.

**2. User Experience Deficiency**
Enterprise systems prioritize comprehensive functionality over intuitive interfaces. Administrative workflows override user-centric design principles, generating frustration across stakeholder populations.

**3. Scalability Constraints**
Legacy systems struggle with rapid institutional growth, additional user populations, and expanding feature requirements without infrastructure investment.

**4. Customization Limitations**
Commercial solutions resist adaptation to institution-specific workflows, forcing organizations to conform to generic processes misaligned with their operational realities.

**5. Technology Debt**
Established platforms built on outdated architectures resist modern integration patterns, API-first approaches, and cloud-native methodologies.

**6. Cost Inefficiencies**
Licensing models based on user counts, institution sizes, or feature tiers generate disproportionate expenses for institutions integrating multiple specialized systems.

**7. Data Accessibility**
Existing systems concentrate data ownership with vendors, limiting institutional ability to generate custom reports, conduct analytics, and make data-driven decisions.

**8. Mobile-First Gap**
Most established systems prioritize desktop experiences, relegating mobile to secondary status despite student preference for mobile-first interaction.

**9. Integration Complexity**
Interconnecting multiple systems requires expensive middleware, custom API development, and ongoing maintenance overhead.

## 2.3 Project Contribution to Addressing Gaps

The USTU Campus platform addresses identified limitations through innovative design decisions:

### Unified Architecture Approach
**Contribution:** Consolidates all campus operations—academics, administration, resources, communication—into single cohesive platform eliminating multi-system navigation and repeated authentication.

### Contemporary Technology Stack
**Contribution:** Leverages modern, open-standard technologies (React, TypeScript, Supabase) enabling rapid development, easy customization, transparent architecture, and future extensibility.

### User-Centric Design Philosophy
**Contribution:** Prioritizes intuitive interfaces, streamlined workflows, and role-specific dashboards reflecting actual user needs rather than forcing adaptation to system requirements.

### Cloud-Native Architecture
**Contribution:** Implements scalable infrastructure supporting institutional growth without catastrophic performance degradation, expensive upgrades, or vendor lock-in constraints.

### Role-Based Customization
**Contribution:** Delivers differentiated experiences for students, faculty, administrators, and support staff, ensuring each population accesses features appropriate to their institutional responsibilities.

### Data Transparency and Ownership
**Contribution:** Maintains institution data ownership, enabling comprehensive analytics, custom reporting, and data-driven institutional decision-making.

### Mobile-Optimized Experience
**Contribution:** Delivers responsive design across devices, recognizing modern student preference for mobile interaction while maintaining full feature accessibility.

### Open Standards and Extensibility
**Contribution:** Employs industry-standard protocols (REST APIs, JSON data interchange), enabling future integration with institutional systems, third-party services, and custom extensions.

### Community-Driven Development
**Contribution:** Adopts transparent development practices, version control (Git), and modular architecture supporting collaborative enhancement and community contributions.

---

# CHAPTER 3: PROPOSED SYSTEM

## 3.1 System Overview

USTU Campus represents a comprehensive, modern web-based platform consolidating all institutional operations into unified, role-specific user experiences. The system architecture embraces contemporary development practices, cloud-native infrastructure, and user-centric design principles.

### Platform Scope

The platform accommodates four primary user populations, each with customized feature sets:

**Student Portal:** Attendance monitoring, grade tracking, assignment submission, resource access, schedule viewing, canteen ordering, feedback mechanisms, and profile management.

**Faculty Dashboard:** Class management, attendance recording, grade input, assignment publishing, resource distribution, communication tools, schedule coordination, and assessment analytics.

**Administrative Interface:** User account management, audit logging, institutional announcements, resource cataloging, system configuration, and analytics dashboard.

**Canteen Management:** Menu planning, order tracking, inventory management, and operational coordination.

## 3.2 System Architecture and Framework

### 3.2.1 Architectural Overview

USTU Campus implements a modern full-stack architecture separating concerns across frontend, backend, and database layers:

```
┌─────────────────────────────────────────────────────────┐
│              CLIENT LAYER (React + TypeScript)          │
│  - React Components   - State Management                │
│  - Responsive UI      - Real-time Updates              │
│  - Accessibility      - Performance Optimization       │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTPS/REST APIs
┌──────────────────────────▼──────────────────────────────┐
│         AUTHENTICATION & AUTHORIZATION (Clerk)         │
│  - User Authentication   - Session Management          │
│  - Role-Based Access     - Permission Enforcement      │
└──────────────────────────┬──────────────────────────────┘
                           │ Secure API Calls
┌──────────────────────────▼──────────────────────────────┐
│      BACKEND LAYER (Supabase REST APIs + RLS)          │
│  - Business Logic      - Data Validation               │
│  - API Routing         - Row-Level Security            │
│  - Integration Layer   - Audit Logging                 │
└──────────────────────────┬──────────────────────────────┘
                           │ SQL Queries
┌──────────────────────────▼──────────────────────────────┐
│       DATABASE LAYER (PostgreSQL via Supabase)         │
│  - User Management     - Academic Records              │
│  - Operational Data    - Transactional Integrity       │
│  - Historical Audit    - Data Consistency              │
└─────────────────────────────────────────────────────────┘
```

### 3.2.2 Technical Stack Architecture

| Layer | Component | Technology | Purpose |
|-------|-----------|-----------|---------|
| **Frontend** | Framework | React 18.3.1 + TypeScript | Component-based UI development with type safety |
| | Styling | Tailwind CSS 4.1.12 | Utility-first CSS framework for rapid UI development |
| | Components | Radix UI + Material UI | Pre-built, accessible UI component libraries |
| | Build Tool | Vite 6.3.5 | Modern, optimized build and development server |
| | Forms | React Hook Form | Efficient, flexible form state management |
| **Routing** | Navigation | React Router v7 | Client-side routing and navigation management |
| **State** | Visualization | Recharts | Interactive charts and data visualization |
| | Interaction | React DnD | Drag-and-drop functionality for interactive UI |
| | Animations | Motion | Smooth, performant animations and transitions |
| **Authentication** | Service | Clerk | Enterprise authentication and user management |
| **Backend** | Database | Supabase (PostgreSQL) | Managed PostgreSQL database with built-in APIs |
| | APIs | REST via Supabase | RESTful API generation from database |
| | Authorization | Row-Level Security (RLS) | Database-level permission enforcement |
| **Utilities** | Date Handling | date-fns | Date manipulation and formatting |
| | QR Generation | qrcode | QR code generation for authentication |
| | Carousels | react-slick | Carousel/slider component |
| | Icons | Lucide React | Comprehensive icon library |
| **Deployment** | Hosting | Vercel | Serverless platform for application hosting |
| | CDN | Vercel Edge Network | Global content delivery network |

### 3.2.3 Module Architecture

The system organizes functionality across six primary modules, each serving distinct institutional needs:

**1. Student Academic Module**
- Attendance tracking and analysis
- Grade viewing and transcript access
- Assignment submission and tracking
- Performance analytics and progress monitoring

**2. Faculty Management Module**
- Class and section management
- Attendance recording and reports
- Grade entry and distribution
- Assignment creation and submission monitoring

**3. Resource & Content Module**
- Learning material distribution
- Document management and versioning
- Resource categorization and discovery
- Access control and sharing

**4. Communication Module**
- Institutional notice distribution
- Schedule announcements
- Real-time notifications
- Feedback and complaint tracking

**5. Administrative Control Module**
- User account and role management
- System configuration
- Audit logging and compliance tracking
- Analytics and reporting

**6. Operational Services Module**
- Canteen menu management
- Order processing and tracking
- Calendar and scheduling
- Library resource coordination

### 3.2.4 User Role Architecture

The system implements hierarchical role-based access control:

```
┌──────────────────────────────────────────────────┐
│           SYSTEM ADMINISTRATOR                    │
│  • Full system access • User management           │
│  • Audit logs • Configuration • Analytics         │
└────────────────┬─────────────────────────────────┘
                 │
    ┌────────────┼────────────┬─────────────┐
    │            │            │             │
┌───▼───┐  ┌────▼────┐  ┌───▼────┐  ┌────▼─────┐
│FACULTY│  │ STUDENT │  │  ADMIN │  │ CANTEEN  │
│       │  │         │  │        │  │  STAFF   │
│(Dept.)│  │(General)│  │(Office)│  │(Kitchen) │
└───────┘  └─────────┘  └────────┘  └──────────┘
```

## 3.3 Module Descriptions and Workflows

### Module 1: Student Academic Portal

**Primary Functions:**
- Real-time attendance tracking with historical analysis
- Comprehensive grade viewing across subjects and assessment types
- Assignment discovery, submission, and deadline tracking
- Performance analytics and comparative statistics
- Profile management and personal information updates

**Workflow:**
Student → Login (Clerk) → Dashboard → Select Module → View/Submit Data → System Processing → Confirmation/Analytics

### Module 2: Faculty Administration Dashboard

**Primary Functions:**
- Classroom and student group management
- Daily/periodic attendance recording
- Grade entry with validation mechanisms
- Assignment publishing with submission tracking
- Real-time student performance monitoring

**Workflow:**
Faculty → Login (Clerk) → Dashboard → Select Class → Choose Function (Attendance/Grades/Assignments) → Data Entry → Validation → System Storage → Audit Log

### Module 3: Resource Distribution System

**Primary Functions:**
- Comprehensive learning material repository
- Subject-wise and category-wise organization
- Version control and update tracking
- Access permission management
- Download and usage analytics

**Workflow:**
Faculty → Upload Resource → Define Permissions → System Processing → Student Discovery → Download/Access → Usage Tracking

### Module 4: Communication Hub

**Primary Functions:**
- Institutional announcement broadcasting
- Schedule modification notification
- Real-time push notifications
- Feedback and suggestion collection
- Complaint tracking and resolution

**Workflow:**
Admin → Create Announcement → Target Audience Selection → Schedule/Publish → Push Notification → Delivery Tracking

### Module 5: Administrative Control Panel

**Primary Functions:**
- User account creation and lifecycle management
- Role assignment and permission configuration
- System audit log review
- Performance metrics and usage analytics
- Configuration management

**Workflow:**
Admin → Access Control Panel → Select Function → Execute Action → Validation → System Update → Audit Log Entry

### Module 6: Canteen Operations

**Primary Functions:**
- Weekly/monthly menu planning
- Student order placement and tracking
- Order status notifications
- Payment processing
- Operational analytics

**Workflow:**
Canteen Manager → Define Menu → Publish Schedule → Students Place Orders → Process/Prepare → Delivery → Feedback

## 3.4 Algorithm and Process Design

### 3.4.1 Authentication & Authorization Algorithm

```
BEGIN Authentication Flow
    INPUT: User Credentials (Email, Password)
    
    STEP 1: Receive login request
    STEP 2: Clerk service validates credentials
        IF credentials invalid
            RETURN: Error message, deny access
        ENDIF
    
    STEP 3: Clerk generates JWT token
    STEP 4: Frontend stores token locally
    STEP 5: Query user role and permissions from database
    
    STEP 6: Load role-specific modules
    STEP 7: Initialize Row-Level Security policies
    
    STEP 8: Present user dashboard based on role
    
    RETURN: Authenticated session with role-specific interface
END
```

### 3.4.2 Attendance Tracking Algorithm

```
BEGIN Attendance Processing
    INPUT: Faculty selects students, marks attendance status
    
    STEP 1: Faculty opens class attendance interface
    STEP 2: System loads enrolled students list
    STEP 3: Faculty marks each student (Present/Absent/Leave)
    STEP 4: System validates entries (minimum requirements)
    
    STEP 5: Validate against institutional policies
        IF invalid (conflicts with existing records)
            RETURN: Error notification
        ENDIF
    
    STEP 6: Calculate attendance percentage
        attendance_percentage = (present_days / total_days) * 100
    
    STEP 7: Check threshold compliance
        IF attendance_percentage < minimum_threshold
            FLAG: Alert (low attendance)
        ENDIF
    
    STEP 8: Store record in database with timestamp
    STEP 9: Generate audit log entry
    STEP 10: Update student dashboard in real-time
    
    RETURN: Confirmation, updated attendance data
END
```

### 3.4.3 Grade Management Algorithm

```
BEGIN Grade Processing
    INPUT: Faculty enters assessment scores
    
    STEP 1: Faculty accesses grade entry interface
    STEP 2: Select assessment type (Test/Assignment/Project)
    STEP 3: Enter scores for enrolled students
    STEP 4: System validates scores
        IF score < 0 OR score > max_score
            RETURN: Error, request re-entry
        ENDIF
    
    STEP 5: Calculate weighted contribution
        subject_score = calculate_weight(assessment_type, score)
    
    STEP 6: Aggregate with existing grades
        total_score = SUM(all_assessment_scores * weights)
    
    STEP 7: Convert to letter grade
        letter_grade = convert_to_grade(total_score)
    
    STEP 8: Generate analytics
        class_average = AVERAGE(all_student_scores)
        percentile = rank_student(total_score, all_scores)
    
    STEP 9: Store in database with timestamp
    STEP 10: Update student transcript
    STEP 11: Generate notification for students
    
    RETURN: Grade recorded, analytics generated
END
```

### 3.4.4 Role-Based Access Control Algorithm

```
BEGIN RBAC Enforcement
    INPUT: User role, requested resource
    
    STEP 1: Retrieve user role from JWT token
    STEP 2: Lookup permission matrix for role
    STEP 3: Evaluate resource permission requirements
    
    IF role MATCHES permission criteria
        STEP 4: Apply Row-Level Security filters
            FILTER data WHERE institutional_hierarchy allows
        STEP 5: Generate filtered data view
        STEP 6: RETURN: Authorized data with restrictions
    ELSE
        STEP 7: RETURN: Access denied, audit event logged
    ENDIF
END
```

### 3.4.5 Notification Dispatch Algorithm

```
BEGIN Notification Processing
    INPUT: Event trigger (new announcement, grade published, etc.)
    
    STEP 1: Identify event type and originator
    STEP 2: Determine target audience based on event
    STEP 3: Query database for eligible recipients
    
    FOR EACH recipient IN target_audience
        STEP 4: Check notification preferences
            IF recipient opted-in to notification type
                STEP 5: Generate personalized notification
                STEP 6: Format for delivery channel (web, email, SMS)
                STEP 7: Queue for dispatch
            ENDIF
    ENDFOR
    
    STEP 8: Process notification queue
    STEP 9: Deliver via configured channels
    STEP 10: Track delivery status
    STEP 11: Update notification read status
    STEP 12: Generate audit log
    
    RETURN: Delivery confirmation
END
```

## 3.5 Process Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USTU CAMPUS PROCESS FLOW                 │
└─────────────────────────────────────────────────────────────┘

START
  │
  ├──► USER VISITS APPLICATION
  │      │
  │      ├─► UNAUTHENTICATED USER
  │      │      │
  │      │      └──► CLERK LOGIN/SIGNUP
  │      │              │
  │      │              └──► AUTHENTICATION
  │      │
  │      └─► AUTHENTICATED USER
  │              │
  │              └──► LOAD USER ROLE & PERMISSIONS
  │                      │
  │                      ├─► STUDENT? ──────────► STUDENT DASHBOARD
  │                      │      │
  │                      │      ├── Attendance View
  │                      │      ├── Grades & Marks
  │                      │      ├── Assignments
  │                      │      ├── Resources
  │                      │      ├── Notifications
  │                      │      └── Profile
  │                      │
  │                      ├─► FACULTY? ──────────► FACULTY DASHBOARD
  │                      │      │
  │                      │      ├── Class Management
  │                      │      ├── Mark Attendance
  │                      │      ├── Enter Grades
  │                      │      ├── Publish Assignments
  │                      │      ├── Share Resources
  │                      │      └── View Analytics
  │                      │
  │                      ├─► ADMIN? ────────────► ADMIN PANEL
  │                      │      │
  │                      │      ├── User Management
  │                      │      ├── Post Announcements
  │                      │      ├── System Audit
  │                      │      ├── Configuration
  │                      │      └── Analytics
  │                      │
  │                      └─► CANTEEN? ──────────► CANTEEN INTERFACE
  │                              │
  │                              ├── Menu Management
  │                              ├── Order Processing
  │                              ├── Operations
  │                              └── Inventory
  │
  ├──► PROCESS REQUEST
  │      │
  │      └──► APPLY ROW-LEVEL SECURITY
  │              │
  │              └──► QUERY DATABASE
  │                      │
  │                      ├──► RETURN FILTERED DATA
  │                      │      │
  │                      │      └──► RENDER UI
  │                      │
  │                      └──► UPDATE AUDIT LOG
  │
  ├──► USER ACTION (Create/Update/Delete)
  │      │
  │      ├──► VALIDATE INPUT
  │      │
  │      ├──► APPLY PERMISSIONS CHECK
  │      │
  │      ├──► PROCESS TRANSACTION
  │      │
  │      ├──► UPDATE DATABASE
  │      │
  │      ├──► GENERATE NOTIFICATION (if applicable)
  │      │
  │      └──► CREATE AUDIT LOG ENTRY
  │
  └──► END

```

## 3.6 Hardware Requirements

| Component | Specification | Rationale |
|-----------|---------------|-----------|
| **Processor** | Quad-core 2.0 GHz or higher | Handles concurrent user processing and API requests |
| **RAM Memory** | 8 GB minimum (16 GB recommended) | In-memory operations, caching, database connection pooling |
| **Storage** | 256 GB SSD minimum | Application code, user uploads, database backups |
| **Network** | High-speed internet (10 Mbps minimum) | Reliable API communication and real-time updates |
| **Client Device** | Modern laptop/desktop or smartphone | Application accessibility across devices |

## 3.7 Software Requirements

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **OS** | Windows/macOS/Linux | Current | Development and production environment |
| **Runtime** | Node.js | 18+ | JavaScript runtime for backend services |
| **Package Manager** | npm or Yarn | Latest | Dependency management |
| **Frontend Framework** | React | 18.3.1 | Component-based UI development |
| **Language** | TypeScript | Latest | Type-safe JavaScript superset |
| **Build Tool** | Vite | 6.3.5 | Fast build and development server |
| **CSS Framework** | Tailwind CSS | 4.1.12 | Utility-first CSS styling |
| **UI Libraries** | Radix UI + Material UI | Latest | Pre-built accessible components |
| **Authentication** | Clerk | Latest | User management and authentication |
| **Database** | PostgreSQL (via Supabase) | Latest | Relational database management |
| **Version Control** | Git | Latest | Source code management |
| **IDE** | VS Code / WebStorm | Latest | Development environment |

## 3.8 Key Features and Functionalities

### 3.8.1 Student Features

**Attendance Portal**
- Real-time attendance status display
- Historical attendance tracking with date-wise records
- Attendance percentage calculation against institutional thresholds
- Export attendance reports
- Automated low-attendance alerts

**Grade Management**
- Subject-wise grade viewing
- Assessment-type breakdown (tests, assignments, projects)
- Historical grade tracking
- Performance analytics and class percentiles
- Comparative statistics

**Assignment Tracking**
- Comprehensive assignment discovery
- Detailed assignment specifications and deadlines
- File submission with version control
- Late submission penalty display
- Submission status tracking

**Resource Access**
- Centralized learning material repository
- Category-wise and subject-wise filtering
- Full-text search functionality
- Download analytics
- Resource rating and reviews

**Calendar and Scheduling**
- Integrated academic calendar view
- Event management and reminders
- Class schedule visualization
- Exam schedule tracking
- Holiday and break notifications

**Canteen Services**
- Menu browsing and ordering
- Order status tracking
- Payment history
- Nutritional information display
- Feedback mechanisms

**Profile Management**
- Personal information updates
- Password management
- Notification preferences
- Privacy settings
- Account deactivation

### 3.8.2 Faculty Features

**Classroom Management**
- Student roster management
- Class division and section assignment
- Student performance monitoring
- Communication with class groups

**Attendance Administration**
- Bulk attendance recording
- Historical attendance modification (with audit trail)
- Attendance analytics by student/class/date
- Automated absence notifications

**Grade Management**
- Flexible assessment creation
- Score entry with validation
- Automatic grade calculation
- Grade distribution analytics
- Student performance reports

**Assignment Management**
- Assignment creation with specifications
- Submission deadline management
- Student submission review
- Grading interface
- Plagiarism detection integration (future)

**Resource Distribution**
- Learning material upload and organization
- Access control management
- Version control and update tracking
- Usage analytics
- Collaborative resource sharing

**Performance Analytics**
- Class-level analytics dashboard
- Individual student performance tracking
- Attendance trend analysis
- Grade distribution analysis
- Predictive performance indicators

### 3.8.3 Administrative Features

**User Management**
- User account creation and lifecycle management
- Role assignment and modification
- Bulk user import from institutional records
- Account deactivation and archival
- Permission assignment

**Announcement Broadcasting**
- Multi-channel announcement creation
- Targeted audience selection
- Scheduled publication
- Delivery tracking
- Analytics (read rates, engagement)

**Audit and Compliance**
- Comprehensive activity logging
- Access history tracking
- Data modification audit trails
- Compliance reporting
- Security event monitoring

**System Configuration**
- Academic calendar management
- Institutional parameters
- Notification settings
- Integration configurations
- Feature toggles

**Analytics Dashboard**
- System usage metrics
- User engagement analytics
- Performance indicators
- Custom report generation
- Data export capabilities

### 3.8.4 Canteen Management Features

**Menu Planning**
- Weekly/monthly menu creation
- Cost and nutritional tracking
- Allergen and dietary restriction management
- Student feedback integration

**Order Management**
- Real-time order processing
- Order status updates
- Student notification system
- Special requirements handling

**Inventory Management**
- Stock tracking and updates
- Supplier management
- Cost analysis
- Waste tracking

---

# CHAPTER 4: CONCLUSION AND FUTURE SCOPE

## 4.1 Summary

The USTU Campus platform successfully addresses critical institutional challenges through comprehensive system integration, contemporary technology implementation, and user-centric design principles. The development of this full-stack web application demonstrates the feasibility and benefits of consolidating disparate campus operations into unified, role-specific user experiences.

### Key Achievements

1. **Operational Consolidation:** Successfully integrated attendance, grading, assignment management, resource distribution, and administrative functions into single platform

2. **Role-Based Architecture:** Implemented sophisticated role-based access control accommodating four distinct user populations with customized dashboards and feature sets

3. **Modern Technology Stack:** Deployed contemporary technologies (React, TypeScript, Supabase, Vercel) ensuring maintainability, scalability, and future extensibility

4. **Security Implementation:** Integrated enterprise-grade authentication (Clerk), authorization mechanisms (RBAC), and database-level security protocols (Row-Level Security)

5. **User Experience Enhancement:** Delivered intuitive, responsive interfaces optimized for diverse user populations and devices

6. **Data Centralization:** Established single source of truth through unified PostgreSQL database, enabling comprehensive analytics and informed decision-making

## 4.2 System Benefits

### For Students
- Simplified single-access platform eliminating repeated authentication
- Comprehensive academic information accessibility
- Real-time notifications for important institutional updates
- Enhanced resource discovery and availability
- Improved communication with faculty and administration

### For Faculty
- Streamlined classroom administration
- Efficient attendance and grading workflows
- Centralized resource distribution
- Enhanced student performance monitoring
- Data-driven pedagogical insights

### For Administration
- Centralized institutional operations management
- Comprehensive audit and compliance tracking
- Data-driven decision-making capabilities
- Reduced administrative overhead and manual processes
- Scalable infrastructure for institutional growth

### For Institutions
- Improved operational efficiency
- Enhanced stakeholder satisfaction
- Reduced technology infrastructure costs
- Competitive advantage through technology investment
- Foundation for future academic innovations

## 4.3 Future Enhancements

### Immediate Extensions (Semester 5-6)

**Advanced Analytics**
- Predictive student performance modeling
- Institutional benchmarking capabilities
- Custom report builder for administrators
- Machine learning-based insights

**Mobile Application**
- Native iOS and Android applications
- Offline-first functionality
- Push notification system
- Mobile-optimized workflows

**Integration Capabilities**
- Third-party LMS integration (Canvas, Blackboard)
- ERP system connectivity
- Email and messaging platform integration
- Payment gateway integration for canteen services

**Enhanced Communication**
- Video conferencing integration
- Chat and instant messaging
- Discussion forums
- Collaborative workspace

### Medium-Term Enhancements (Year 2)

**Academic Intelligence**
- Course recommendation engine
- Learning path personalization
- Adaptive learning materials
- Career guidance system

**Operational Optimization**
- Resource optimization algorithms
- Facility scheduling system
- Maintenance management
- Energy consumption tracking

**Accessibility and Inclusivity**
- Multi-language support
- Enhanced accessibility features (WCAG compliance)
- Assistive technology integration
- Diverse user interface themes

### Long-Term Vision (Year 3+)

**Institutional Ecosystem**
- Alumni engagement platform
- Placement and recruitment integration
- Research collaboration systems
- Industry partnership portal

**Advanced Technologies**
- Artificial intelligence tutoring systems
- Augmented reality learning materials
- Blockchain-based credential verification
- IoT device integration for campus operations

**Global Capabilities**
- International student support
- Multi-institutional collaboration
- Geo-distributed deployment
- Regulatory compliance for diverse jurisdictions

## 4.4 Lessons Learned and Recommendations

### Technical Insights

1. **Monolithic to Microservices:** Consider future migration to microservices architecture for enhanced scalability and independent component deployment

2. **API Design:** Implement comprehensive API versioning strategy to support future platform evolution

3. **Database Optimization:** Implement advanced indexing and query optimization as user volume scales

4. **Performance Monitoring:** Establish continuous performance monitoring and optimization practices

### Organizational Insights

1. **Change Management:** Invest in comprehensive user training and change management initiatives during institutional deployment

2. **Feedback Loops:** Establish continuous feedback mechanisms enabling responsive feature refinement

3. **Stakeholder Engagement:** Involve all user populations throughout development lifecycle

4. **Phased Rollout:** Consider staged deployment across departments rather than institution-wide simultaneous launch

### Best Practices for Replication

1. **Prioritize User Experience:** Invest in UX research and usability testing throughout development

2. **Security First:** Implement security considerations from project inception rather than as afterthought

3. **Documentation:** Maintain comprehensive technical and user documentation facilitating future maintenance and knowledge transfer

4. **Community Building:** Foster community around platform through user forums, feature requests, and collaborative development

---

# APPENDIX

## A.1 Technology Deep Dive

### A.1.1 React and TypeScript

**React** represents a JavaScript library enabling construction of dynamic user interfaces through reusable component architecture. React's virtual DOM and efficient rendering mechanisms deliver responsive user experiences. **TypeScript** adds static type checking, improving code reliability and enabling better development tooling.

Key advantages:
- Component reusability across platform
- Efficient rendering performance
- Strong ecosystem and community
- Type safety preventing runtime errors
- Excellent developer experience

### A.1.2 Vite Build System

Vite modernizes frontend development through:
- Extremely fast development server startup
- Instant Hot Module Replacement (HMR)
- Optimized production builds
- Native ES module support
- Plugin-based extensibility

### A.1.3 Tailwind CSS Framework

Tailwind CSS provides utility-first styling approach:
- Rapid UI development through pre-defined utilities
- Consistent design system
- Minimal CSS bundle size through tree-shaking
- Responsive design helpers
- Dark mode support

### A.1.4 Radix UI and Material UI

**Radix UI** offers unstyled, accessible component primitives providing foundation for custom designs while ensuring accessibility compliance.

**Material UI** provides comprehensive pre-styled component library following Material Design principles with extensive customization options.

### A.1.5 Clerk Authentication Platform

Clerk provides enterprise-grade authentication:
- Multi-factor authentication support
- Social login integration
- Session management
- User activity monitoring
- Built-in security features

### A.1.6 Supabase and PostgreSQL

**Supabase** wraps PostgreSQL in modern interface providing:
- Automatic REST API generation
- Real-time subscriptions
- Built-in authentication integration
- Row-Level Security policies
- Comprehensive backup and recovery

**PostgreSQL** offers robust relational database:
- ACID compliance ensuring data integrity
- Advanced query optimization
- JSON support for flexible data
- Extensive extension ecosystem
- Open-source reliability

### A.1.7 React Router v7

Modern routing framework enabling:
- Client-side routing without page reloads
- Nested route support
- URL parameter handling
- Layout management
- Code splitting by route

### A.1.8 React Hook Form

Efficient form management:
- Minimal re-renders
- Flexible validation
- File upload support
- Integration with UI component libraries
- Minimal bundle size

### A.1.9 Recharts Visualization

Interactive charting library:
- Responsive charts automatically adapting to container
- Extensive chart types
- Tooltip and legend customization
- Animation support
- Accessibility features

### A.1.10 React DnD

Drag-and-drop functionality:
- Flexible, customizable interactions
- Comprehensive event handling
- Touch device support
- Accessibility features
- Performance optimization

### A.1.11 Vercel Deployment Platform

Modern deployment infrastructure:
- Serverless deployment of Next.js and static sites
- Automatic builds from Git
- Global CDN distribution
- Preview deployments for branches
- Analytics and monitoring

## A.2 Git and Version Control

### Git Workflow

The project employs standard Git workflow:

```
MAIN BRANCH (Production)
    ↓
DEVELOP BRANCH (Integration)
    ↓
FEATURE BRANCHES
    ├── feature/student-dashboard
    ├── feature/faculty-grading
    ├── feature/admin-controls
    └── feature/canteen-management
```

### Commit Message Convention

```
<type>(<scope>): <subject>

feat: Add student attendance dashboard
fix: Resolve authentication token expiration
docs: Update database schema documentation
style: Format code according to prettier rules
refactor: Simplify role-based access logic
test: Add unit tests for grade calculation
```

### Branch Naming Convention

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code improvements
- `test/description` - Testing additions

## A.3 Project Setup and Running Instructions

### Prerequisites

```bash
# Install Node.js (18.0 or higher)
# Install npm or Yarn package manager
# Install Git for version control
```

### Installation Steps

```bash
# Clone repository
git clone https://github.com/aarush-ustu/USTU-CAMPUS.git
cd USTU-CAMPUS

# Install dependencies
npm install
# or
yarn install

# Configure environment variables
cp .env.example .env.local
# Edit .env.local with actual values:
# VITE_CLERK_PUBLISHABLE_KEY=...
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...
```

### Development Environment

```bash
# Start development server
npm run dev
# or
yarn dev

# Server runs on http://localhost:5173
# Hot module replacement enabled for instant updates
```

### Production Build

```bash
# Build for production
npm run build
# or
yarn build

# Preview production build locally
npm run preview

# Deployment
# Connected to Vercel through Git
# Push to main branch triggers automatic deployment
```

### Testing

```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Generate coverage report
npm run test:coverage
```

### Database Migrations

```bash
# View migration status
supabase migration list

# Apply pending migrations
supabase db push

# Create new migration
supabase migration new migration_name
```

## A.4 Database Schema Overview

### Core Tables

**users**
- user_id (UUID, Primary Key)
- email (String, Unique)
- full_name (String)
- role (Enum: student, faculty, admin, canteen)
- department_id (Foreign Key)
- created_at (Timestamp)
- updated_at (Timestamp)

**attendance**
- attendance_id (UUID, Primary Key)
- student_id (Foreign Key → users)
- class_id (Foreign Key → classes)
- date (Date)
- status (Enum: present, absent, leave)
- recorded_by (Foreign Key → users)
- created_at (Timestamp)

**grades**
- grade_id (UUID, Primary Key)
- student_id (Foreign Key → users)
- subject_id (Foreign Key → subjects)
- assessment_type (Enum: test, assignment, project, exam)
- score (Numeric)
- max_score (Numeric)
- recorded_by (Foreign Key → users)
- recorded_date (Timestamp)
- created_at (Timestamp)

**assignments**
- assignment_id (UUID, Primary Key)
- faculty_id (Foreign Key → users)
- subject_id (Foreign Key → subjects)
- title (String)
- description (Text)
- due_date (Timestamp)
- created_at (Timestamp)
- updated_at (Timestamp)

**submissions**
- submission_id (UUID, Primary Key)
- assignment_id (Foreign Key → assignments)
- student_id (Foreign Key → users)
- file_url (String)
- submission_date (Timestamp)
- grade_received (Numeric)
- feedback (Text)

**resources**
- resource_id (UUID, Primary Key)
- uploaded_by (Foreign Key → users)
- title (String)
- description (Text)
- file_url (String)
- subject_id (Foreign Key → subjects)
- access_level (Enum: public, restricted, private)
- created_at (Timestamp)

**announcements**
- announcement_id (UUID, Primary Key)
- created_by (Foreign Key → users)
- title (String)
- content (Text)
- target_audience (Enum: all, students, faculty, admin)
- published_date (Timestamp)
- expiry_date (Timestamp)
- created_at (Timestamp)

**canteen_orders**
- order_id (UUID, Primary Key)
- student_id (Foreign Key → users)
- order_date (Date)
- total_amount (Numeric)
- status (Enum: pending, preparing, ready, delivered, cancelled)
- created_at (Timestamp)

## A.5 API Endpoints

### Authentication Endpoints
```
POST   /auth/login              - User login
POST   /auth/logout             - User logout
POST   /auth/signup             - User registration
GET    /auth/verify             - Verify authentication
POST   /auth/refresh-token      - Refresh JWT token
```

### Student Endpoints
```
GET    /api/students/attendance - Get attendance records
GET    /api/students/grades     - Get grade information
GET    /api/students/assignments - List assignments
POST   /api/students/submissions - Submit assignment
GET    /api/students/resources  - List available resources
GET    /api/students/profile    - Get profile information
PUT    /api/students/profile    - Update profile
```

### Faculty Endpoints
```
GET    /api/faculty/classes     - List teaching classes
POST   /api/faculty/attendance  - Record attendance
PUT    /api/faculty/grades      - Enter grades
POST   /api/faculty/assignments - Create assignment
GET    /api/faculty/resources   - Manage resources
GET    /api/faculty/analytics   - Class analytics
```

### Admin Endpoints
```
GET    /api/admin/users         - List all users
POST   /api/admin/users         - Create user
PUT    /api/admin/users/:id     - Update user
DELETE /api/admin/users/:id     - Delete user
GET    /api/admin/audit-logs    - Access audit logs
POST   /api/admin/announcements - Create announcement
GET    /api/admin/analytics     - System analytics
```

### Canteen Endpoints
```
GET    /api/canteen/menu        - Get menu
POST   /api/canteen/menu        - Create/update menu
GET    /api/canteen/orders      - List orders
PUT    /api/canteen/orders/:id  - Update order status
GET    /api/canteen/analytics   - Sales analytics
```

## A.6 Troubleshooting Guide

### Common Issues and Solutions

**Issue: Clerk authentication not working**
```
Solution:
1. Verify VITE_CLERK_PUBLISHABLE_KEY in .env.local
2. Check Clerk dashboard for instance configuration
3. Ensure CORS settings allow your domain
4. Clear browser cache and restart dev server
```

**Issue: Supabase connection failing**
```
Solution:
1. Verify database credentials in .env.local
2. Check Supabase project status
3. Ensure IP whitelist includes your network
4. Verify JWT token validity
5. Check database connection pool limits
```

**Issue: Slow application performance**
```
Solution:
1. Run performance profiler (DevTools)
2. Check for unnecessary re-renders (React DevTools)
3. Optimize database queries (check execution plans)
4. Implement code splitting for routes
5. Consider caching strategies
```

**Issue: Build failures**
```
Solution:
1. Clear node_modules and reinstall: rm -rf node_modules && npm install
2. Clear Vite cache: rm -rf .vite
3. Check for TypeScript errors: npm run type-check
4. Verify all environment variables set
5. Check for dependency version conflicts
```

---

# REFERENCES

[1] Vercel Team, "Vercel Documentation - Deployment Platform," 2024. [Online]. Available: https://vercel.com/docs. [Accessed May 1, 2026].

[2] Facebook & Meta Community, "React Official Documentation - JavaScript Library for Building User Interfaces," 2024. [Online]. Available: https://react.dev. [Accessed May 1, 2026].

[3] Microsoft, "TypeScript Documentation - Typed Superset of JavaScript," 2024. [Online]. Available: https://www.typescriptlang.org/docs/. [Accessed May 1, 2026].

[4] Supabase Team, "Supabase Documentation - Open-Source Firebase Alternative," 2024. [Online]. Available: https://supabase.com/docs. [Accessed May 1, 2026].

[5] The PostgreSQL Global Development Group, "PostgreSQL Documentation - Advanced Open Source Database," 2024. [Online]. Available: https://www.postgresql.org/docs/. [Accessed May 1, 2026].

[6] Vite Team, "Vite Documentation - Modern Frontend Build Tool," 2024. [Online]. Available: https://vitejs.dev/. [Accessed May 1, 2026].

[7] Tailwind Labs, "Tailwind CSS Documentation - Utility-First CSS Framework," 2024. [Online]. Available: https://tailwindcss.com/docs. [Accessed May 1, 2026].

[8] Radix UI Team, "Radix Primitives Documentation - Unstyled, Accessible Components," 2024. [Online]. Available: https://www.radix-ui.com/docs. [Accessed May 1, 2026].

[9] Clerk Team, "Clerk Documentation - Authentication Platform," 2024. [Online]. Available: https://clerk.com/docs. [Accessed May 1, 2026].

[10] Recharts Team, "Recharts Documentation - Composable Charting Library," 2024. [Online]. Available: https://recharts.org/. [Accessed May 1, 2026].

[11] React Router Contributors, "React Router Documentation - Dynamic Route Matching," 2024. [Online]. Available: https://reactrouter.com/. [Accessed May 1, 2026].

[12] React Hook Form Team, "React Hook Form Documentation - Performant Forms," 2024. [Online]. Available: https://react-hook-form.com/. [Accessed May 1, 2026].

[13] Git Team, "Git Documentation - Distributed Version Control," 2024. [Online]. Available: https://git-scm.com/doc. [Accessed May 1, 2026].

[14] GitHub, "GitHub Documentation - Repository Hosting Platform," 2024. [Online]. Available: https://docs.github.com. [Accessed May 1, 2026].

[15] Sommerville, I., "Software Engineering: A Practitioner's Approach," 10th ed. McGraw-Hill, 2015.

[16] Pressman, R. S., "Software Engineering: A Practitioner's Approach," Pearson Education, 2014.

[17] Bass, L., Clements, P., & Kazman, R., "Software Architecture in Practice," 3rd ed. Addison-Wesley, 2012.

[18] Newman, S., "Building Microservices: Designing Fine-Grained Systems," O'Reilly Media, 2015.

[19] Marz, N., & Warren, J., "Big Data: Principles and Best Practices of Scalable Realtime Data Systems," Manning Publications, 2015.

[20] IEEE, "IEEE Standard Glossary of Software Engineering Terminology," IEEE Std 610.12, 1990.

---

## SCHEDULE FOR MINI PROJECT EXECUTION

| Date | Week | Activity | Deliverable |
|------|------|----------|-------------|
| Feb 3, 2026 | 1 | Team Formation & Project Selection | Team Announcement |
| Feb 10, 2026 | 2 | Project Proposal Submission | 3 Project Ideas per Team |
| Feb 17, 2026 | 3 | Team Presentations to Review Panel | Selected Project Finalization |
| Feb 24, 2026 | 4 | Guide Allocation Based on Domain | Guide Assignment |
| Mar 3, 2026 | 5 | Literature Survey & Planning | Research Documentation |
| Mar 10, 2026 | 6 | System Design & Architecture | Design Documentation |
| Mar 17, 2026 | 7 | Progress Review with Guide | Mid-Point Evaluation |
| Mar 31, 2026 | 8 | Mid-Semester Presentation | Project Status Review |
| Apr 7, 2026 | 9 | Development & Refinement | Code Submission |
| Apr 14, 2026 | 10 | Testing & Documentation | Quality Assurance Reports |
| Apr 21, 2026 | 11 | Final Project Completion | Code Repository Finalization |
| Apr 28, 2026 | 12 | Final Presentation & Evaluation | External Examination |

---

## EXAMINER'S FEEDBACK FORM

**Name of External Examiner:** _________________________________  
**College of External Examiner:** _________________________________  
**Name of Internal Examiner:** _________________________________  
**Date of Examination:** _____ / _____ / _____

**No. of students in project team:** _____  
**Availability of separate lab for the project:** Yes / No

### Student Performance Analysis

| Sr. No. | Observation | Excellent (3) | Very Good (2) | Good (1) |
|---------|------------|-------|------------|------|
| 1 | Quality of problem definition and clarity | ☐ | ☐ | ☐ |
| 2 | Innovativeness and uniqueness in solution approach | ☐ | ☐ | ☐ |
| 3 | Cost effectiveness and societal impact considerations | ☐ | ☐ | ☐ |
| 4 | Full functionality of working system per stated requirements | ☐ | ☐ | ☐ |
| 5 | Effective application of relevant technical skill sets | ☐ | ☐ | ☐ |
| 6 | Adherence to standard engineering norms and practices | ☐ | ☐ | ☐ |
| 7 | Individual contribution as team member or leader | ☐ | ☐ | ☐ |
| 8 | Clarity and effectiveness of written and oral communication | ☐ | ☐ | ☐ |
| 9 | Overall project performance and execution quality | ☐ | ☐ | ☐ |

### Additional Questions

**Can this mini project extend to next semester with added objectives/ideas?** Yes / No

**If yes, suggest new innovative techniques/ideas/objectives:**

_________________________________________________________________  
_________________________________________________________________  
_________________________________________________________________  
_________________________________________________________________

---

**Signature of External Examiner:** ___________________________  
**Signature of Internal Examiner:** ___________________________

---

**END OF REPORT**

This comprehensive mini project report has been prepared in fulfillment of the requirements for B.Tech Computer Science and Engineering Semester IV at Universal Skilltech University.

**Report Prepared By:**  
Team Leader: Aarush  
Team Members: Amisa, Kritika, Aayush

**Supervised By:**  
Prof. Sandeep Dubey  
Department of Computer Science & Engineering

**Date of Submission:** May 1, 2026
