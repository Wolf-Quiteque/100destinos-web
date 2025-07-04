# Rent-a-Car Simulation Plan

**Objective:** To completely simulate a car rental process with dummy data, local storage for rented cars, and a simplified payment method, ensuring smooth UI/UX and no conflicts with existing code. Users should be able to see their rented car, and it should be removed from local storage once the rental period passes.

**Current State Analysis:**

*   **`app/rent-a-car/page.js`**:
    *   Displays a static list of cars (`carData`) with model, price, and image.
    *   Includes a search form with "Retirada" (Pickup) and "Devolução" (Return) tabs, and date/location inputs (currently non-functional).
    *   Each car has a "Alugar Agora" (Rent Now) button.
    *   Uses Supabase for user authentication and profile fetching for the avatar display.
    *   Styling is handled by `app/rent-a-car/style.css`.

*   **`app/pagamento/page.js`**:
    *   Handles payment confirmation for bus tickets.
    *   Features a file upload mechanism for proof of payment, with verification against external APIs (`https://verifica-jet.vercel.app/upload`, `https://glab-api.vercel.app/api/aef/comprovativos`, `https://glab-api.vercel.app/api/aef/add`).
    *   Integrates with Vendus API for invoice generation for specific companies.
    *   Uses `useToast` for user notifications.
    *   Displays booking details, user profile, and total price.

**Proposed Plan:**

The simulation will be entirely client-side, leveraging `localStorage` for persistence of rented cars and `sessionStorage` for temporary rental details during the payment flow. The payment method will be a simplified dummy version, not involving actual API calls or file uploads.

---

## Step-by-Step Implementation Plan:

### 1. Enhance `app/rent-a-car/page.js` for Rental Logic

**Goal:** Make the "Rent Now" button functional, allow date selection, and prepare for a payment confirmation step.

*   **1.1. State Management:**
    *   Introduce new `useState` hooks for:
        *   `selectedCar`: Stores the car object chosen for rental.
        *   `rentalStartDate`: Stores the selected pickup date.
        *   `rentalEndDate`: Stores the selected return date.
        *   `showPaymentModal`: Boolean to control the visibility of a payment confirmation modal.
        *   `rentalDuration`: Number of days for the rental.
        *   `totalRentalPrice`: Calculated total price for the rental.

*   **1.2. Date Picker Integration:**
    *   Replace the static `input type="text"` for "Data de retirada" and "Data de devolução" with interactive date pickers.
    *   **Recommendation:** Utilize existing UI components like `components/ui/calendar.jsx` and `components/ui/popover.jsx` to create a user-friendly date selection experience.
    *   Implement logic to calculate `rentalDuration` (in days) and `totalRentalPrice` based on the selected dates and the car's daily price. The `carData` currently has prices as strings like "50.000 kz". This will need to be parsed into a number for calculation.

*   **1.3. "Rent Now" Button Functionality:**
    *   Modify the `onClick` handler for the "Alugar Agora" button on each `car-card`.
    *   This handler will:
        *   Set the `selectedCar` state with the details of the clicked car.
        *   Open a payment confirmation modal by setting `showPaymentModal` to `true`.
        *   Pass `selectedCar`, `rentalStartDate`, `rentalEndDate`, `rentalDuration`, and `totalRentalPrice` to this modal.

*   **1.4. Search Button (`Buscar Carros`) Functionality (Optional for initial simulation):**
    *   For the initial dummy simulation, the "Buscar Carros" button can remain non-functional or simply trigger a toast message indicating it's a future feature. The focus is on the "Rent Now" flow.

### 2. Create a Simplified Payment/Confirmation Modal

**Goal:** Provide a simplified payment interface that simulates a successful transaction and stores rental data in `localStorage`.

*   **2.1. New Component/Modal:**
    *   Create a new React component, e.g., `RentConfirmationModal.js`, or embed the logic directly as a conditional render within `app/rent-a-car/page.js`. Using a separate component is cleaner.
    *   This modal will receive the `selectedCar`, `rentalStartDate`, `rentalEndDate`, `rentalDuration`, and `totalRentalPrice` as props.

*   **2.2. Replicate Essential Payment UI:**
    *   Display the selected car's image, model, rental dates, and the calculated `totalRentalPrice`.
    *   Include a prominent "Confirmar Pagamento" (Confirm Payment) button.
    *   Add a "Voltar" (Back) or "Cancelar" (Cancel) button to close the modal.

*   **2.3. Dummy Payment Logic (`handleConfirmPayment`):**
    *   When "Confirmar Pagamento" is clicked:
        *   Set a `processingPayment` state to `true` and display a loading spinner (e.g., using `Loader2` icon from `lucide-react`).
        *   Simulate a network request delay using `setTimeout` (e.g., 1-2 seconds).
        *   After the delay:
            *   Generate a unique `rentalId` (e.g., using `Date.now()` combined with a random string).
            *   Construct a `rentedCarObject` with all necessary details:
                ```javascript
                {
                    id: 'unique-rental-id',
                    model: selectedCar.model,
                    price: selectedCar.price, // Keep original string price for display
                    dailyPrice: parsedDailyPrice, // Store numeric daily price for calculations
                    img: selectedCar.img,
                    rentalStartDate: rentalStartDate.toISOString(), // Store as ISO string
                    rentalEndDate: rentalEndDate.toISOString(),
                    rentalDuration: rentalDuration,
                    totalRentalPrice: totalRentalPrice,
                    rentedAt: new Date().toISOString() // Timestamp of rental confirmation
                }
                ```
            *   Retrieve existing rented cars from `localStorage` (`JSON.parse(localStorage.getItem('rentedCars') || '[]')`).
            *   Add the new `rentedCarObject` to the array.
            *   Save the updated array back to `localStorage` (`localStorage.setItem('rentedCars', JSON.stringify(updatedArray))`).
            *   Display a success toast message using `useToast` (e.g., "Carro alugado com sucesso!").
            *   Set `processingPayment` to `false`.
            *   Close the modal (`showPaymentModal` to `false`).
            *   Optionally, redirect the user to a "My Rented Cars" page or update the current page to reflect the rental.

### 3. Implement "My Rented Cars" Section/Page

**Goal:** Allow users to view their currently rented cars and automatically remove expired rentals.

*   **3.1. New Page (`app/meus-alugueis/page.js`):**
    *   Create a new page dedicated to displaying rented cars. This provides a clear separation and better UX.
    *   Add a link to this page from `app/rent-a-car/page.js` (e.g., in the header, near the avatar, or as a new button).

*   **3.2. Load from Local Storage:**
    *   On component mount (`useEffect`), retrieve the `rentedCars` array from `localStorage`.
    *   Initialize a state variable (e.g., `rentedCarsList`) to store this data.

*   **3.3. Expiration Logic:**
    *   When loading `rentedCarsList` from `localStorage`:
        *   Filter out cars whose `rentalEndDate` (parsed as a Date object) is in the past relative to the current date.
        *   Update `localStorage` with the filtered (active) list of cars.
    *   This ensures that expired rentals are automatically removed when the user visits the "My Rented Cars" page. For a more real-time removal, a `setInterval` could be used, but for a dummy simulation, on-load filtering is sufficient.

*   **3.4. Display Rented Cars:**
    *   Iterate through the `rentedCarsList` state and render each active rented car.
    *   For each car, display:
        *   Car image (`img`).
        *   Model (`model`).
        *   Rental period (`rentalStartDate` to `rentalEndDate`).
        *   Total price (`totalRentalPrice`).
        *   Optionally, a "Devolver Carro" (Return Car) button that manually removes it from `localStorage` and updates the list.

### 4. Local Storage Management Utilities

**Goal:** Centralize `localStorage` operations for consistency and ease of use.

*   **4.1. Helper Functions (e.g., in `lib/utils.js` or a new `hooks/useLocalStorage.js`):**
    *   `getRentedCars()`: Retrieves and parses the `rentedCars` array from `localStorage`.
    *   `addRentedCar(car)`: Adds a new car object to the `rentedCars` array in `localStorage`.
    *   `removeRentedCar(id)`: Removes a car by its `id` from the `rentedCars` array in `localStorage`.
    *   `updateRentedCars(updatedList)`: Saves an entire updated list back to `localStorage`.

### 5. UI/UX Considerations

**Goal:** Ensure a smooth and intuitive user experience.

*   **5.1. Clear Feedback:**
    *   Use `useToast` (already available from `@/hooks/use-toast`) for all success, error, and informational messages (e.g., "Carro alugado com sucesso!", "Por favor, selecione as datas de aluguel.").
*   **5.2. Loading States:**
    *   Implement loading indicators (spinners, disabled buttons) during simulated payment processing.
*   **5.3. Responsive Design:**
    *   Ensure all new components and modifications are responsive and look good on various screen sizes (mobile, tablet, desktop). Leverage existing Tailwind CSS classes.
*   **5.4. Navigation:**
    *   Provide clear navigation paths:
        *   Back button from the payment modal.
        *   Link to "My Rented Cars" page.
        *   Clear flow from car selection to payment to confirmation.
*   **5.5. Date Picker Text Color:**
    *   Adjust the styling of the selected date text within the `Calendar` component to ensure it is visible (e.g., black text on a light background, or a contrasting color). This might involve overriding Tailwind CSS classes or adding custom CSS.

### 6. Code Organization and Best Practices

**Goal:** Maintain a clean, modular, and maintainable codebase.

*   **6.1. Modularity:**
    *   Keep new components (e.g., `RentConfirmationModal`, `MyRentedCarsPage`) separate and focused on their specific responsibilities.
*   **6.2. Reusability:**
    *   Utilize existing UI components from `components/ui` (e.g., `Button`, `Card`, `Dialog`, `Input`, `Label`) to maintain consistency.
*   **6.3. Error Handling:**
    *   Implement basic error handling for `localStorage` operations (e.g., `try-catch` blocks for `JSON.parse`).
    *   Validate user inputs (e.g., ensure dates are selected before proceeding to payment).
*   **6.4. No Conflict with Existing Code:**
    *   The payment simulation will be entirely client-side and will not interact with the existing Supabase/Vendus API logic from `app/pagamentos/page.js`.
    *   New state variables and functions will be scoped to the `RentACar` component or new components to avoid global conflicts.
    *   The `carData` prices will need to be parsed from string to number for calculations, but the original string format can be kept for display.

---

## New Requirements & Updates:

### 7. Enhance Search Functionality in `app/rent-a-car/page.js`

**Goal:** Implement a simulated search feature and enforce date selection before renting.

*   **7.1. State for Filtered Cars:**
    *   Introduce a new `useState` hook, `filteredCarData`, initialized with the full `carData`. This will be the array rendered in the `car-list`.
*   **7.2. "Buscar Carros" Button Logic:**
    *   Modify the `onClick` handler for the "Buscar Carros" button.
    *   This handler will:
        *   Simulate a search (e.g., by filtering `carData` based on dummy criteria or simply setting `filteredCarData` to a subset/all cars to simulate a successful search). For a true simulation, it could just re-render all cars or a specific set.
        *   Display a success toast message (e.g., "Busca realizada com sucesso!").
*   **7.3. Prompt for Dates on Direct "Rent Now":**
    *   The existing `handleRentNowClick` already checks for `rentalStartDate` and `rentalEndDate`. This logic is sufficient. If dates are not selected, it will show a toast message.

### 8. Replicate Payment Process with PDF Upload Simulation

**Goal:** Simulate the PDF upload and API confirmation process from `app/pagamentos/page.js` for car rentals, saving car sale info to local storage.

*   **8.1. Create `RentPaymentModal.js` Component:**
    *   Extract the payment confirmation logic from `app/rent-a-car/page.js` into a new dedicated component, e.g., `components/RentPaymentModal.js`. This will make the code cleaner and more modular.
    *   This component will receive `selectedCar`, `rentalStartDate`, `rentalEndDate`, `rentalDuration`, `totalRentalPrice`, and a `onPaymentSuccess` callback as props.
*   **8.2. Implement PDF Upload UI:**
    *   Within `RentPaymentModal.js`, replicate the file input (`<input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf" className="hidden" />`) and associated UI elements (upload button, file name display, loading spinner, error message) from `app/pagamentos/page.js`.
    *   Use `useRef` for the file input and `useState` for `uploadedFile`, `processingPayment`, and `comprovativoErro`.
*   **8.3. Simulate API Verification:**
    *   Modify the `handleFileUpload` function in `RentPaymentModal.js`.
    *   Instead of making actual `fetch` calls to `verifica-jet.vercel.app` and `glab-api.vercel.app`, simulate their responses using `setTimeout`.
    *   **Dummy Verification Logic:**
        *   After a delay, simulate a successful verification.
        *   If `file.name` contains "error" (for example), simulate a failure and set `comprovativoErro` to `true`.
        *   If successful, proceed to save the rental data.
*   **8.4. Save Sale Information to Local Storage:**
    *   Upon successful simulated verification (within `handleFileUpload` after the `setTimeout`):
        *   Construct the `rentedCarObject` as previously defined (id, model, dates, prices, etc.).
        *   Retrieve existing rented cars from `localStorage`.
        *   Add the new `rentedCarObject` to the array.
        *   Save the updated array back to `localStorage`.
        *   Call the `onPaymentSuccess` callback passed from `app/rent-a-car/page.js` to close the modal and show a success toast.
*   **8.5. Integrate `RentPaymentModal`:**
    *   In `app/rent-a-car/page.js`, replace the inline `Dialog` and its content with the `RentPaymentModal` component, passing the necessary props.

### 9. Display IBAN and Copy Functionality in Payment Modal

**Goal:** Provide users with the company's IBAN and a button to copy it, mirroring the payment details section in `app/pagamentos/page.js`.

*   **9.1. Add IBAN Constant:**
    *   Define a constant for the IBAN (e.g., `0055.0000.1009.6480.1012.9`) within `components/RentPaymentModal.js`.
*   **9.2. Implement Copy Functionality:**
    *   Create a `copyIBAN` function that uses `navigator.clipboard.writeText` to copy the IBAN to the clipboard and displays a success toast.
*   **9.3. Integrate UI:**
    *   Add a section in `components/RentPaymentModal.js` to display the company name (e.g., "ZRD3 CONSULTING") and the IBAN, along with a `Copy` icon button (from `lucide-react`) that triggers the `copyIBAN` function. Position this prominently, perhaps above the file upload section.

---

This updated plan addresses all new requirements, focusing on client-side simulation for efficiency and maintaining modularity.
Step 9. Display IBAN and Copy Functionality in Payment Modal - COMPLETED
Step 10. Integrate Tabs into MeusBilhetesPage - COMPLETED
Step 10. Integrate Tabs into MeusBilhetesPage - COMPLETED
Step 10. Integrate Tabs into MeusBilhetesPage - COMPLETED
Step 11. Apply Minor Edits to MeusServicosPage - COMPLETED
