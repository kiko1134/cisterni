#ifndef MOBILE_DEVICE_H
#define MOBILE_DEVICE_H

#include "Device.h"

// Concrete device with an extra battery level (integer, clamped to 0..100).
class MobileDevice : public Device {
    int battery;

public:
    MobileDevice(const std::string& name, int battery);
    // Restoration constructor (keeps the given ID).
    MobileDevice(int id, const std::string& name, int battery);

    int getBattery() const { return battery; }

    std::string type() const override { return "mobile"; }
    void print() const override;
    Device* clone() const override;
    void writeFields(std::ostream& os) const override;
};

#endif // MOBILE_DEVICE_H
