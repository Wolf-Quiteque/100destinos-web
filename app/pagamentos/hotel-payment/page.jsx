import { Suspense } from 'react';
import HotelPaymentContent from './HotelPaymentContent';

export default function HotelPaymentPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <HotelPaymentContent />
        </Suspense>
    );
}
