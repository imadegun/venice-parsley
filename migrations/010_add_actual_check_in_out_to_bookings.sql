-- Add actual check-in/check-out timestamps to track occupancy
ALTER TABLE bookings 
  ADD COLUMN check_in_actual TIMESTAMPTZ,
  ADD COLUMN check_out_actual TIMESTAMPTZ;

-- Add index for occupancy queries
CREATE INDEX idx_bookings_actual_check_in ON bookings(check_in_actual);
CREATE INDEX idx_bookings_actual_check_out ON bookings(check_out_actual);

-- Add comment to document the fields
COMMENT ON COLUMN bookings.check_in_actual IS 'Actual check-in timestamp (when guest physically checks in)';
COMMENT ON COLUMN bookings.check_out_actual IS 'Actual check-out timestamp (when guest physically checks out)';
