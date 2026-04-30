// All 4 email templates styled with Airbnb brand color #FF5A5F

// 1. WELCOME EMAIL
export const welcomeEmail = (name: string, role: string): string => {
  const roleMessage = role === "HOST"
    ? `<p>You're registered as a <strong>Host</strong>. Ready to share your space with the world? <a href="#" style="color:#FF5A5F;">Create your first listing</a> and start earning today!</p>`
    : `<p>You're registered as a <strong>Guest</strong>. Adventure awaits! <a href="#" style="color:#FF5A5F;">Explore listings</a> and find your perfect stay.</p>`;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #FF5A5F; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Welcome to Airbnb</h1>
      </div>
      <div style="padding: 30px; background-color: #f9f9f9;">
        <h2 style="color: #FF5A5F;">Hey ${name}! 👋</h2>
        <p>We're so excited to have you join our community.</p>
        ${roleMessage}
        <p>If you have any questions, we're always here to help.</p>
        <p>With love,<br/><strong>The Airbnb Team</strong></p>
      </div>
    </div>
  `;
};

// 2. BOOKING CONFIRMATION EMAIL
export const bookingConfirmationEmail = (
  guestName: string,
  listingTitle: string,
  location: string,
  checkIn: string,
  checkOut: string,
  totalPrice: number
): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #FF5A5F; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Booking Confirmed!</h1>
      </div>
      <div style="padding: 30px; background-color: #f9f9f9;">
        <h2 style="color: #FF5A5F;">Hi ${guestName}!</h2>
        <p>Your booking has been confirmed. Here are your details:</p>
        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #FF5A5F;">
          <p><strong>🏠 Listing:</strong> ${listingTitle}</p>
          <p><strong>📍 Location:</strong> ${location}</p>
          <p><strong>📅 Check-in:</strong> ${checkIn}</p>
          <p><strong>📅 Check-out:</strong> ${checkOut}</p>
          <p><strong>💰 Total Price:</strong> $${totalPrice}</p>
        </div>
        <p style="margin-top: 20px; color: #888; font-size: 13px;">
          Please note: Cancellations made 48 hours before check-in are fully refundable.
        </p>
        <p>Enjoy your stay!<br/><strong>The Airbnb Team</strong></p>
      </div>
    </div>
  `;
};

// 3. BOOKING CANCELLATION EMAIL
export const bookingCancellationEmail = (
  guestName: string,
  listingTitle: string,
  checkIn: string,
  checkOut: string
): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #FF5A5F; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Booking Cancelled</h1>
      </div>
      <div style="padding: 30px; background-color: #f9f9f9;">
        <h2 style="color: #FF5A5F;">Hi ${guestName},</h2>
        <p>Your booking has been cancelled. Here are the details:</p>
        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #FF5A5F;">
          <p><strong>🏠 Listing:</strong> ${listingTitle}</p>
          <p><strong>📅 Check-in:</strong> ${checkIn}</p>
          <p><strong>📅 Check-out:</strong> ${checkOut}</p>
        </div>
        <p style="margin-top: 20px;">
          We're sorry to see your plans change. 
          <a href="#" style="color: #FF5A5F;">Find another listing</a> and plan your next adventure!
        </p>
        <p>Take care,<br/><strong>The Airbnb Team</strong></p>
      </div>
    </div>
  `;
};

// 4. PASSWORD RESET EMAIL
export const passwordResetEmail = (name: string, resetLink: string): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #FF5A5F; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Password Reset</h1>
      </div>
      <div style="padding: 30px; background-color: #f9f9f9;">
        <h2 style="color: #FF5A5F;">Hi ${name},</h2>
        <p>We received a request to reset your password. Click the button below to proceed:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="background-color: #FF5A5F; color: white; padding: 14px 28px; 
                    text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">
            Reset My Password
          </a>
        </div>
        <p style="color: #888; font-size: 13px;">⏰ This link expires in <strong>1 hour</strong>.</p>
        <p style="color: #888; font-size: 13px;">If you did not request this, please ignore this email. Your password will remain unchanged.</p>
        <p>Stay safe,<br/><strong>The Airbnb Team</strong></p>
      </div>
    </div>
  `;
};