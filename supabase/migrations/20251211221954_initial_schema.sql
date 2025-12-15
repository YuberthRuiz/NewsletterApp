-- Create enum for slot status
CREATE TYPE slot_status AS ENUM ('available', 'booked', 'fulfilled');

-- Creators table
CREATE TABLE creators (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    newsletter_name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    timezone TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SlotTypes table
CREATE TABLE slot_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

-- Slots table
CREATE TABLE slots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    slot_type_id UUID NOT NULL REFERENCES slot_types(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status slot_status DEFAULT 'available'
);

-- Bookings table
CREATE TABLE bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slot_id UUID NOT NULL REFERENCES slots(id) ON DELETE CASCADE,
    sponsor_name TEXT NOT NULL,
    sponsor_email TEXT NOT NULL,
    website_url TEXT,
    ad_copy TEXT,
    creative_file_url TEXT,
    payment_status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE slot_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policies for creators
CREATE POLICY "Creators can view their own data" ON creators
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Creators can insert their own data" ON creators
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Creators can update their own data" ON creators
    FOR UPDATE USING (auth.uid() = id);

-- Policies for slot_types
CREATE POLICY "Creators can manage their slot types" ON slot_types
    FOR ALL USING (auth.uid() = creator_id);

-- Policies for slots
CREATE POLICY "Creators can manage their slots" ON slots
    FOR ALL USING (auth.uid() = creator_id);

-- Policies for bookings
CREATE POLICY "Creators can view bookings for their slots" ON bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM slots
            WHERE slots.id = bookings.slot_id
            AND slots.creator_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can create bookings" ON bookings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Creators can update bookings for their slots" ON bookings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM slots
            WHERE slots.id = bookings.slot_id
            AND slots.creator_id = auth.uid()
        )
    );