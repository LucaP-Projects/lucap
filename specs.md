# **LucaP (v1.0.0) Technical Specification**

*High-Level System Architecture, Security Enclaves, and Omnichannel Framework for a Unified Next.js Portal*

## **1\. Executive & Product Strategy**

The core mandate of **LucaP** (pronounced "Lucapp") is to serve as the unified, premium digital conduit between **Luca Pacioli (Andersen Group Tunisia)**, its active client portfolio, and potential business leads.

By applying the Hormozi Value Equation:

![][image1]The initial version of LucaP maximizes value by radically reducing **Effort & Sacrifice** and **Time Delay** across two fundamental business actions:

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
| **Edge Router** | Nginx | SSL/TLS termination, request size limiting (![][image2] strict cap). | Public (Port 80/443) |
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

[image1]: <data:image/png;base64,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>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADQAAAAWCAYAAACPHL/WAAAEX0lEQVR4Xq1WW4hWVRQ+J7ELGlQ0/ij/v/fZw9DgSD34EzpaYEOvQRfIpxjqIehFpYd68pI6oAgiFiRIL2a+iVPEVPxN0JPihIlRQRSID15SGEkGUZDpW/t21llnn7moH//i7POtb6291779J8sqyMtnHtollWyniZKpuRyR1x0OjGajqZAyMmQUqBI1931BZJEjewDw6FomuRgWTREp7QIRQxtneT4wlRxT9b3C5Fprk6pSKfW+0npteO/r61teFMV+2DpLJGKQ6yZs1prSs6YoRqUmAHmegu6/qIeB24R+P+Jcwm5C83mr1VoWk3U6nVUIfh0D7kFwivUTAX5SayWTHRsaGno0aOol5dmzKBwdXiI98k9IRQA070BzhvqgtvQXhTnkfW9zHu+vgr+O2F8CsQXFXMAMfgbyLpxNBf0E+xU2jZgfNOKkpoTbV27Rcpr9s4iboKKMMa0g4UC/J+DfbQet1VtB4lNkGN+Yn0Tr48DKf0I+ydOgZ3Rlhcpewf+IWSrqnvR7RG63ExX0HnWK9jZLh5FmNvdK2jZ4bne7wBUUE8DgSxTk4pFzVBQUE88oVhAfJHw9BBaMqqCxoMytUOHOyB3YaalAMVvBj7iC5KAdXEF2y9d8yL1PLWyFSriCzLvofBzt87BzsGGpq8BNLjo0Z+kV+pN+wKu5DNt3nJR63oKEz63+B+Duwb5icgflC0rNNvhvYXspCfnR/hR2sd1uPyO1ErRC/rmZBoXnruDr7+9/DtxBauOcJAqKuycUROeYLi+y3z33xeDg4JOVAD/IxhUyxrwQX3KrXe2TjQUuDWw5g4JyOrzmcehvwf4OXqz4ThS43ucUBZVJqR/n4+cry9qdzsuUDzn+8pQPcglxhuzyl0gONM9aK1rLfOe/CVcNmPkpetpJU/pL+k9CIRudT/0cdbWCSriC5IXhgL+dFymO9e1atiC3nysA/ybsWvwPcHLa89T5v1zLEfJDYwsiYMJeowMM7jBsWNM2LnWxoFxMjE6dIQbkvSo5WxC2x9eSL/w9T9uDcXRrUQenGz82PXT40wO63e5SzPI0uMvIcQhn8Hmmq6wQZWWTYgtS5Et0B/5KfIlBSs+YovimQhKv9Ruw4zSYyCn1kutA7SiVAT7YPzRbIQIm5gjFhssiwBakfEGLWCFwG8hXIQcGBh4DeRs2mdVPQo5BfG/8dxucj2h36/3Z7rSfENoKELcGuhuwV8KEaPefg+879THXgttDPN2GnKcOUegB8slPH3AG9gfsTiBGID7ji5n19g+sRx+gbMlXwo5q+02np2DHkPzpsvSwKuVcaP5x6qznXUvQvoaBF06nPiS/P1vRzFwfp24lg30HXTd2nEZ124jmPODKhUctHnPkrrly+tWLCkhQEfKGCmigHwJosCF7Uy+2oDqIa5p/7pPPBYMFytz8KVHjLVFjU4nmu6QDFqmihn9pWuESQVhlGVg2gaZCLZr4TLjm0DWjKaiJz7L/AfTmRhgt2yR8AAAAAElFTkSuQmCC>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAYCAYAAAAVibZIAAACbUlEQVR4Xp2UTWsUQRCGd6JoDoGgZmLMzvTHzATMHkT8BeJB8KQIgiAqKOYgiCfBkxePghD16EVU/DioSEARL2rMQQ/R3+BFQRAMZBGR9a3t6t2a6Zk1WNDbXU/VW13dM7Ot1gYsqlmVLSpH+k6QGwA25kFYFo2airJJLuvV8BBg1lofwlhVSr3BvIT5AiJjMp0SwU8i/gJjRWn92FqrRXg4G2v2Imk5y7JJYlgfwOhh3JQCrdV5FPqUZ/k0IWxwBTlf89z5JdNK34KgZ4w57kgUIXkNYz2O4wki6Ggn/K5W6pg48hjYF4xLA+KDgFcx/mAcZUZFf1G3cTw1QQjrs+Sj+J5hgT5/rZR+6VQM/ZznWeoBOqbr6JGAw3wa3cNRU/lwwJ5grFljxiVncyTLs0lj7HMkfiyKIvZR+E/5imakWGn1kHiaprkjlcrY7TLEn5G0jvV+GUOxV4OiwpB/n08170ilqHeRcEK5xDOeYr1ERW1Y9B4VTZJkrlqvRWLJ6PgYXVzFbvbvkhib7ZL5YA+It9vtHZ7TkWcAf6OLbnt2dsoHcMw7fKzrRIw1p7noPrf7oOgytO+dznESGxb/yOglZgHwWzxx3KE9TAgv+jaIf2I+5eWdTmcLcr6DXRzU9IYuHkFwG8vN5CNpge4U8zNs4D5V18ARbL4CbxMhfAjn4K9i4/HSdZJTzBVbIVhEwjfMH7DBOwgWvFgKjLUHkXdNuzu+kaTJ9uCJS+OT+59/2jCr8tcXWMAqf8C11pjDgaDThvSKje60bxspWsM9GrkDd10TGW3ytE3ioO8A/K81iet4fad1mcKCcLn1vxnUgI06VfAzAAAAAElFTkSuQmCC>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAZCAYAAADJ9/UkAAADpUlEQVR4Xo1VSWgUQRSdjjEaFOMWQpLuquqeEXQiKg4hCIrbQTwIKqhEvUjAmwviQRFcQAUvXkJA8KAEBcGLB8ElKgpCJAEjGIgbKsFDXDCQgOBB4vu1dU0vIZ/86ar331/q1+9OoZArXhKQ4nmxJZtRLZ5mVXNppxFDsKaMqBbKM7qwjZvG7DoOmDBkSq7BWmJGPjfD5BWEEBuhA5yzSXoyzrscs1TG2GHO+VoDLW1snA/uFWhHTFRP3w/awb3LGX+G54MgCNqry9RrBK0gwAfoppbWVh/7OyhiCk4nNVsK9k+hhLvaWy6X6ywJ18IY3wP/MRGGHZQDnBPQb1jPinn6CUMfEm8zeKlUmgPnL6j6D9aNBgePTjEEHUeBj6BH4zZ68o8z1oyuTQgRnnL8+qnQYrEYJLteA/IkjB+jqNhghg+Br+mTdZkZw/oJihSK4rTOEboG8vODoMU53HbEO2forlctTvlTOvh+yYDYXyUMTkccrE+EQtjcGcnRrfcUT26oGQlKqmTczWoE3mKsZMQJHuvkWw1PJhfiELB7WL+Bvoaus3GEWKi7NQzdD94LPPuBn65UKrOrsqbrVoLqQ1T/F44vC0TT5QO/D+yiccS6G/oVLV5MGCa6qJKzMTx7QKmNoqgB60EUcsMmyM0MA8i9II+2YvJdSxiGq9w9eCvUW8Eu0R7JV+qT/4PvEmd+jhGOIVzj+mtzXIkIRSeIvymQBenwbrV62dTUNI+CMs7e0h4+LTr555gsO3ZA8hi77OJVQu87vWJB4LcnbXDeDdt3vMN7HdjTyX5QReW2tjq9f+VwaBb2abxH/XOwB1GLYhQFMH4KfH+DsWC/GY47aR0KcUFWz/HKaFEDJj9G/Y4PDeGQ2SuMHZS+jDsnl3k9CjIXOoAEne4VwOEMku3Q613QW3JqtcC2Xt/5WYPRZIM34fKAHVfJ9ZsTp6DPIbsJ4zi0D/ocOgL9xeSQiOWa5iHZw9B+xws14ND0j+Cu6008fNPrgQ3D7zx5UXcQZxBYt2q4Mzv4fC7AQExRZbI61Uar7ncb+2bodU7feCYD0luxKI6mBFe3DN24Dfs7tHqUpt3YVHKngOklm5gYmfQm200JtcAsLJIlCTjh5ILuIrFWu5wMWaLLy/TIBFMi3eUtz4yvJYOce6h0hQpJYPosamN/EmKwLFsKTCeYiaRpslwXTlAS1aYCSP8kaCSv9Q42TepYqgxpVhrJlhnwcipzJAeexhDLfyTozveYsTKgAAAAAElFTkSuQmCC>