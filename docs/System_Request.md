# 📋 System Request Document

## Urban Maid Service - Web-Based Maid Booking Platform

---

## 1. Business Need

**Problem Statement:**

Urban households struggle to find reliable, verified domestic help through informal networks. Current methods lack transparency, efficiency, trust, and payment security. Simultaneously, domestic workers face challenges in finding consistent work, building credibility, and ensuring fair payment.

**Business Opportunity:**

The Urban Maid Service platform provides a centralized web solution connecting verified maids with customers, creating value through:
- Easy access to verified, rated maids with transparent pricing
- Professional platform for maids to showcase skills and secure bookings
- Revenue generation through subscriptions and service commissions
- Formalization of the domestic work sector

---

## 2. Business Requirements

### Functional Requirements

**User Management & Authentication**
- Multi-role registration (Customer, Maid, Admin) with email verification
- JWT-based authentication with password reset functionality
- Profile management with address geocoding

**Maid Verification & Service Management**
- Admin service category management (create, update, delete)
- Maid approval workflow with document verification (NID, Passport)
- Search and filter by service type, location, rate, rating, availability
- Weekly schedule and blocked slot management

**Booking & Scheduling**
- Real-time booking with automatic conflict detection
- Status workflow: Pending → Accepted/Rejected → Completed/Cancelled
- Email and in-app notifications

**Subscription & Payment**
- Two plan types: Hours-based and Works-based (30-day validity)
- Subscription booking with automatic balance deduction
- Maid payment confirmation and dispute tracking (24-hour resolution)

**Review & Rating**
- Customer reviews (1-5 stars, 500 character limit)
- Automatic rating aggregation and display

**Admin Dashboard**
- User metrics, booking statistics, revenue tracking
- User management (activate/deactivate accounts)
- Subscription plan management

### Non-Functional Requirements

- **Performance**: < 3s page load, < 500ms API response, 100+ concurrent users
- **Security**: HTTPS encryption, bcrypt password hashing, JWT authentication, input validation
- **Usability**: Responsive design, max 3 clicks to features, WCAG 2.1 Level AA compliance
- **Reliability**: 99.5% uptime, daily backups, error logging
- **Scalability**: Modular architecture, database indexing, cloud-ready

---

## 3. Business Value

**Quantifiable Benefits:**

*For Customers:*
- 70% reduction in time finding maids
- Transparent pricing with no hidden charges
- 40% estimated increase in satisfaction through verified maids

*For Maids:*
- 30% increase in booking frequency
- Profile-based credibility building
- Payment dispute resolution mechanism

*For Business:*
- Subscription revenue: $60,000-$300,000 annually (500 customers projected)
- Service commission: $20,000 annually (10% of 2,000 bookings at $100 avg)
- First-mover advantage in local market

**Strategic Benefits:**
- Platform credibility through verification system
- User behavior analytics for targeted marketing
- Network effects (more maids attract more customers)
- Social impact through formalization of domestic work sector

---

## 4. Special Issues and Constraints

### Technical Constraints

**Technology Stack:**
- Mandatory MERN stack (academic requirement)
- Limited to JavaScript ecosystem

**Third-Party Dependencies:**
- SendGrid API: 100 emails/day free tier (may need upgrade)
- Google Maps API: 28,500 requests/month limit

**Development:**
- 4-month sprint-based timeline
- 4-developer team (1 feature per member)
- Git feature branching workflow

### Business Constraints

**Legal & Compliance:**
- Must comply with local data protection laws
- Maids classified as independent contractors
- Platform liability limited (marketplace model)

**Payment Processing:**
- No integrated payment gateway (Stripe/PayPal)
- Manual payment confirmation workaround
- Future requirement: automated payment integration

**Geographic Scope:**
- Phase 1: Single city (Dhaka, Bangladesh)
- Multi-city expansion requires additional logic

### Operational Constraints

**Customer Support:**
- Email-based support only (no 24/7 live chat)
- FAQ section for self-service

**Maid Verification:**
- Manual admin review (~20 maids/day capacity)
- Scalability bottleneck
- Future: Automated OCR/AI verification

**Dispute Resolution:**
- 24-hour manual admin review
- No automated arbitration
- Potential delays during high volume

### Security Constraints

**Data Storage:**
- Password hashing and token expiry implemented
- Document uploads require secure cloud storage

**Authentication:**
- JWT tokens in localStorage (XSS vulnerability)
- Mitigation: Short expiry, future HTTP-only cookies

**API Security:**
- Rate limiting not yet implemented
- CORS configured for specific origin only

---

**Document Version:** 1.0  
**Date:** January 2, 2026
