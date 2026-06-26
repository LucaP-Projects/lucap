# **LucaP (v1.0.0) Technical Specification**

*High-Level System Architecture, Security Enclaves, and Omnichannel Framework for a Unified Next.js Portal*

## **1\. Executive & Product Strategy**

The core mandate of **LucaP** (pronounced "Lucapp") is to serve as the unified, premium digital conduit between **Luca Pacioli (Andersen Group Tunisia)**, its active client portfolio, and potential business leads.

By applying the Hormozi Value Equation:

1. **Frictionless Financial Documentation Capture:** Moving the burden of uploading invoices, credit notes, and quotes from complex manual workflows down to a quick mobile or web capture.  
2. **Omnichannel Support & Direct Service Provisioning:** Translating chaotic communication vectors (In-App, Email, WhatsApp) into a single, prioritized ticket thread with Intercom-like two-way routing and manual activity logging for off-system events (physical meetings, calls).

## **2\. Platform Roles & Expected Functions**

The system is built around five primary user roles, each possessing distinct operational boundaries and system capabilities.

       \[ Public Gateway \]                         \[ Private Administrative Boundary \]  
               │                                                  │  
 ┌─────────────┴─────────────┐                      ┌─────────────┴─────────────┐  
 ▼                           ▼                      ▼                           ▼  
\[ Lead (Guest) \]     \[ Client User \]       \[ Staff Operator \]       \[ Admin / Partner \]  
(Sandbox Access)     (Tenant Portal)       (Triage Console)         (Global Controller)

### **2.1 Unauthenticated Lead (Guest / Prospect)**

* **Context:** Potential business partners, startups looking to incorporate, or companies seeking an expert tax audit/infrastructure consultation.  
* **Expected Function:**  
  * Submits limited business documentation (e.g., current setup files or competitor quotes) to request advisory proposals.  
  * Initiates short-term ticket inquiries regarding company formation, tax structuring, or dynamic services.  
  * Operates strictly within an isolated, time-bounded sandbox environment.

### **2.2 Authenticated Client User**

* **Context:** Onboarded companies and startups legally contracted with Luca Pacioli.  
* **Expected Function:**  
  * Uploads bulk files (invoices, credit memos, quotes) to build a continuous digital ledger.  
  * Reviews up-to-date accounting states and historical transaction ledgers.  
  * Requests, tracks, and manages specialized business services (VPN setup, ERP, email archiving).  
  * Maintains a direct, chronological conversation line with assigned accountants and consultants.

### **2.3 Staff Accountant / Consultant**

* **Context:** Luca Pacioli accounting specialists who handle client compliance.  
* **Expected Function:**  
  * Reviews incoming client transaction files against manual metadata selections.  
  * Finalizes accounting records and validates local tax compliance.  
  * Replies directly to financial tickets and provides contextual accounting advisory.

### **2.4 Staff IT / Security Operator (SysAdmin)**

* **Context:** Technical engineers managing client security infrastructure.  
* **Expected Function:**  
  * Triage technical infrastructure request tickets (VPN configurations, ERP rollouts, Archiving issues).  
  * Monitors external digital exposure logs and security dashboards (RASD).  
  * Provisions virtual network connections and maintains server deployments.

### **2.5 Administrator / Partner (e.g., Arcelin)**

* **Context:** Senior leadership of Luca Pacioli.  
* **Expected Function:**  
  * Holds full, unhindered visibility across all client tenants, leads, and operational queues.  
  * Converts validated sandbox Leads into official authenticated Client entities.  
  * Manages the dynamic catalog of marketplace services (adds, retires, or edits services).  
  * Logs off-system activities manually (calls, Zoom meetings, physical visits) to maintain communication history.

## **3\. System Topology & Network Isolation**

To run securely on a single dedicated server instance, the system employs isolated networking boundaries to isolate the public internet from internal microservices.

 \[ Public Client (Web / Mobile App) \]       \[ Staff / Admin Portal \]  
                 │                                      │  
                 ▼ (HTTPS / TLS 1.3 \- Port 443\)         ▼ (HTTPS / TLS 1.3 \- Port 443\)  
                      \[ Reverse Proxy (Nginx) \]  
                                 │  
                                 ▼ (Local TCP Proxy \- Port 3000\)  
                     \[ Next.js Unified Instance \] ──(Private Virtual Network / Local Socket)  
                      ▲             ▲             │  
                      │             │             ├────────► \[ PostgreSQL DB \]  
                 (Twilio /      (SendGrid /       │          (Metadata & Ledger)  
                 WhatsApp Web)  Email Webhook)    │  
                                                  ▼  
                                        \[ MinIO Object Storage \]  
                                        (Encrypted Payload Blocks)

### **Infrastructure Component Matrix**

| Service | Technology | Role | Network Boundary |
| :---- | :---- | :---- | :---- |
| **Edge Router** | Nginx | SSL/TLS termination, request size limiting (strict cap). | Public (Port 80/443) |
| **Application Server** | Next.js (Node.js LTS) | React frontend, middleware authorization, stream-based API route handlers, and webhook routers. | Private Loopback (Port 3000\) |
| **Object Storage** | MinIO (Self-hosted) | S3-compatible backend. Access isolated exclusively to server-side Next.js instances. | Internal Private Network |
| **Database** | PostgreSQL | Transaction ledgers, tenancy states, service schemas, ticket threads. | Internal Private Network |
| **Key Management** | HashiCorp Vault | Storage and administration of Master Key Encryption Keys (KEKs). | Internal Private Network |

## **4\. Security & Storage Enclave Blueprint**

Because LucaP supports both authenticated clients and unauthenticated leads, security logic must enforce strict multi-tenancy rules at the data storage layer.

### **4.1 Tenancy Isolation Strategy**

1. **Client Tenancy (lucap-clients bucket):** Dedicated to active, onboarded Luca Pacioli clients. Highly structured prefix paths partition directories by unique Tenant UUID. In compliance with local commercial law, files in this bucket utilize MinIO **Object Locking** (WORM architecture) to guarantee audit-readiness and prevent accidental deletion.  
2. **Lead Tenancy (lucap-sandbox bucket):** A transit bucket for unauthenticated or non-client users submitting files for one-off advisory quotes. This bucket has an aggressive Lifecycle rule configured to permanently hard-delete objects after ![][image3] days, minimizing long-term security exposure and storage costs.

### **4.2 Secure Stream Processing Pipeline**

The Next.js server acts as an authenticated **stream proxy**. The application runtime *never* buffers incoming file uploads in server RAM or local disk temp directories, which prevents memory-exhaustion Denial of Service (DoS) vectors.

\[ Multi-part Multi-File Stream \]  
               │  
               ▼  
 \[ Node.js IncomingMessage Stream \]  
               │  
               ├─► \[ Magic Byte Validator \] ──► (Reject mismatch / .exe spoofing)  
               ├─► \[ ClamAV TCP Stream \]     ──► (Abort stream if malware signature found)  
               ├─► \[ EXIF Metadata Stripper \]──► (Run via 'sharp' for images only)  
               │  
               ▼  
\[ Cryptographic Stream Pipeline \] ──► Encrypts stream chunks via AES-256-GCM  
               │  
               ▼ (Buffered Pipeline Pipe)  
\[ Target MinIO S3 Stream Upload \]

### **4.3 Cryptographic Envelope Encryption Flow**

Every file ingestion triggers a unique on-the-fly encryption execution:

1. The Next.js route handler generates a cryptographically random ![][image4]\-bit **Data Encryption Key (DEK)** in server memory.  
2. The route handler requests the encryption of the DEK from HashiCorp Vault using a master **Key Encryption Key (KEK)**.  
3. The incoming document stream is piped on-the-fly through an AES-256-GCM cipher stream initialized with the plaintext DEK.  
4. The encrypted stream is uploaded to MinIO.  
5. The *encrypted DEK* and unique Initialization Vector (IV) are written securely into the PostgreSQL database alongside document metadata.

## **5\. Non-Client / Lead Portal (The Sandbox Environment)**

A restricted gateway designed strictly for top-of-funnel conversion. Users do not require a formal client registration, and all submitted assets reside in the short-lived, automated-deletion sandbox.

### **5.1 Module A: Fast-Capture Inquiry Ledger**

* **Purpose:** Allows potential leads to quickly upload existing business files to request a structured consultation, CIT exemption audit, or transition assessment.  
* **Key Features:**  
  * *Ad-Hoc Asset Uploader:* Drag-and-drop or camera capture interface accepting multi-format uploads (PDF, HEIC, PNGs).  
  * *Basic Classification:* Dropdowns to label files (e.g., "Competitor Invoice," "Current Setup Plan," "Financial Statement").  
  * *Lead Registration Form:* Captures fundamental contact details (Name, Company, Phone/WhatsApp, Email) associated with the uploaded files.

### **5.2 Module B: Direct Inquiry & Setup Ticketing**

* **Purpose:** Captures lead requests regarding standard services or offshore company formation inquiries.  
* **Key Features:**  
  * *Prospect Message Composer:* Simple text input box allowing prospects to describe their structural or technical requirements.  
  * *Pre-Configured Service RFPs:* Standardized questionnaires for leads interested in offshore setup, tax audits, or cybersecurity scanning (RASD).  
  * *Progress Tracker:* A read-only timeline view showing the lead if their proposal is "In Review," "Prepared," or "Ready for Meeting."

## **6\. Unified Client Portal (Authenticated Environment)**

The secure, core interface designed for fully onboarded, paying clients of Luca Pacioli. It acts as their day-to-day administrative command room.

### **6.1 Module A: Dynamic Fast-Capture Ledger**

* **Purpose:** The daily utility layer. Allows clients to easily capture and log financial transactions in bulk to maintain up-to-date business ledgers.  
* **Key Features:**  
  * *Fast-Capture Drag-and-Drop:* Clean camera capture and multi-file drag-and-drop mechanism.  
  * *Minimalist Metadata Toggles:* Quick classification toggles to skip administrative typing:  
    * **Transaction Direction:** Purchase (Achat) or Sales (Vente).  
    * **Document Classification:** Invoice (Facture), Credit Memo (Avoir), or Quote (Devis).  
    * **Financial State:** Paid (Payé) or Pending (En attente).  
  * *Real-Time Ledger Queue:* A timeline tracking uploads currently pending validation from their assigned accountant vs. those officially finalized into the database ledger.

### **6.2 Module B: Omnichannel Ticket Thread**

* **Purpose:** Solves the chaotic multi-channel communication trap by unifying all client support requests, IT setups, and document questions into a single, interactive message stream.  
* **Key Features:**  
  * *In-App Message Feed:* Chronological, Intercom-style feed between the client and the Luca Pacioli staff.  
  * *Service Request Trigger:* A clean directory where clients can request the activation of Arcelin's core ecosystem services:  
    * **Secure corporate VPN setup**  
    * **Standard email archiving server integration**  
    * **Cloud or on-prem ERP web deployment**  
  * *Direct Reply routing:* If a client replies via email or WhatsApp, the system automatically appends the reply to this unified ticket thread.

## **7\. Staff & Admin Command Portal**

The operational powerhouse of the system. accessible exclusively to authenticated internal team members and administrators, organized around workflow triage and tenant overview.

### **7.1 Module A: Multi-Tenant Triage Console**

* **Purpose:** The central workspace for accountants, sysadmins, and partners to process client activity systematically.  
* **Key Features:**  
  * *Document Verification Queue:* Displays incoming files from the client portals. Staff can inspect files side-by-side with the client's metadata selections and make adjustments before committing the files to the permanent ledger.  
  * *Omnichannel Support Inbox:* Displays all open client and lead ticket threads.  
  * *In-Line Response Switcher:* Staff write a single response, and the system dynamically routes it back via the customer’s active channel (Email, WhatsApp, or In-App).

### **7.2 Module B: Platform Governance & Management**

* **Purpose:** Administrative tools for managing platform state, services, and conversions.  
* **Key Features:**  
  * *Lead-to-Client Converter:* A tool that allows Arcelin or senior staff to transition a sandbox lead, along with all their previous documents, into a permanent client tenant profile with a single click.  
  * *Dynamic Service Configuration:* An interface allowing administrators to publish, edit, or retire services from the marketplace list (VPN, ERP, Archiving) dynamically.  
  * *Manual Activity Logging:* Enables staff to manually log off-system real-world touchpoints directly into a client's ticket timeline:  
    * **Log a Phone Call:** Duration, summary notes, and action items.  
    * **Log a Physical Meeting:** Meeting minutes, location, and agreements.  
    * **Internal Staff Notes:** Hidden comments visible only to assigned Luca Pacioli team members.

## **8\. Conceptual Data Model**

Rather than raw database definitions, the system relies on a clean hierarchical relationship model that structures tenancy and logs transaction and ticket events.

\+------------------+         \+------------------+  
|     Tenants      |◄───────\*|      Users       |  
| (Client/Sandbox) |         | (Roles & Access) |  
\+------------------+         \+------------------+  
         │                            │  
         │                            │  
         ├──\* \[ Documents \]           ├──\* \[ Tickets \]  
         │    \- Target Bucket         │    \- Origin Channel  
         │    \- Metadata / Keys       │    \- Service Links  
         │                            │  
         │                            ▼  
         └───────────────────\* \[ Ticket Replies \]  
                               \- Message / Internal Note  
                               \- Activity Logs (Call/Meeting)  
                               \- Authored By User/Staff

### **Key Entities**

* **Tenant:** Defines the administrative boundary (Client vs. Sandbox Lead) and enforces file storage location isolation.  
* **User:** Contains identities, password hashes, contact channels, and role access levels (Client, Staff, Administrator).  
* **Document:** Represents metadata for uploaded invoices, quotes, or credit memos, including envelope encryption keys (wrapped DEKs) and file path keys.  
* **Ticket:** Represents a single thread of inquiry, which can optionally map directly to standard infrastructure services (ERP, VPN, Archiving).  
* **Ticket Reply:** Chronological activity timeline containing client messages, staff replies, internal notes, or manually logged off-system actions (calls, meetings, physical visits), mapped to the originating author.

## **9\. Conceptual Integration Matrix & Channel Isolation**

The unified communications layer routes tasks dynamically depending on the interaction interface.

       \[ Input Channel \]  ─────►  \[ Processing Router \] ─────►  \[ Outbound Response \]  
         
         \- Web / App App           \- Match User Tenant            \- In-App Push  
         \- WhatsApp Webhook        \- Create or Append Thread      \- Twilio WhatsApp Relay  
         \- SMTP / Email Gateway    \- Auto-detect Target Relay     \- SendGrid SMTP Relay  
         \- Staff Manual Entry      \- Log Off-System Activity      \- Internal Sync Only

### **9.1 Routing Operations**

* **In-App Interactions:** Synchronous state updates over WebSocket or secure polling within the portal interface.  
* **External Integrations:** Decoupled webhooks that match metadata (sender identifiers) against registered tenant records to append inbound communications directly to the correct database entities.  
* **Offline / Manual Logging:** Bypasses external communication relays. Instead, these logs record internal state tracking to map physical, real-world touchpoints to the timeline database.

### **9.2 Privacy & Direct Communication Boundaries (The "Arcelin Sandbox")**

To guarantee absolute confidentiality and protect personal, sensitive exchanges on Arcelin's (or other senior executives') personal devices, the platform implements a strict **Zero-Exposure Policy** for private endpoints.

 \[ Personal WhatsApp / Personal Email \] ──(No System Hook)──► \[ Securely Isolated \]  
   
 \[ Shared Twilio Business API Number \]  ──(Web Ingestion)──► \[ Processing Router \] ──► \[ Staff Console \]

1. **Exclusion of Personal Endpoints:**  
   * The platform’s background listeners and webhook routing gateways are physically restricted from tracking, intercepting, or integrating with Arcelin’s personal phone numbers, direct messaging accounts, or personal email addresses.  
2. **Corporate-Only Gateways:**  
   * All automated messaging integrations hook strictly into dedicated, corporate-owned endpoints (e.g., a shared Twilio-provisioned business number and dedicated group aliases like support@lucapacioli.tn or tickets@lucapacioli.tn).  
3. **The Selective Logging & Forwarding Pattern:**  
   * To record an exchange originating from a personal channel on the official ticket timeline without exposing the account, Arcelin uses a manual process:  
     * *Manual Capture:* He creates a manual timeline log using the **Staff Manual Entry** dashboard to summarize client interactions.  
     * *Message Forwarding:* He manually forwards the client's work-related message to the official corporate WhatsApp or support email address, where the platform's processing router automatically matches the incoming text to the client's record and appends it to the ticket thread.

## **10\. Operational Implementation Path**

To successfully launch the initial system iteration, development tasks are divided into four focused, decoupled steps:

* **Phase A: Environment Configuration & Basic Sync**  
  * Set up local environment instances for PostgreSQL, MinIO, and HashiCorp Vault.  
  * Initialize database schemas matching the conceptual tables.  
* **Phase B: Secure File Pipeline**  
  * Construct Next.js App Router API Route Handlers supporting stream-based parsing of multiparts.  
  * Connect the Node.js native encryption envelope pipeline to security keys extracted from the Vault integration.  
* **Phase C: Omnichannel Routing, Manual Logging & Ticket UI**  
  * Assemble the standard customer-facing conversational component.  
  * Build webhook endpoints for incoming messages to map user identity logic.  
  * Implement the Staff timeline UI to separate messages, notes, and activity logs visually.  
* **Phase D: Hardened Dedicated Server Deployment**  
  * Isolate PostgreSQL, MinIO, and Vault on a private network, opening only port 443 via reverse-proxying through Nginx on the host machine.
