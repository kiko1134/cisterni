#ifndef DESKTOP_DEVICE_H
#define DESKTOP_DEVICE_H

#include "Device.h"

// Concrete device with an extra URL address (non-empty string).
class DesktopDevice : public Device {
    std::string url;

public:
    DesktopDevice(const std::string& name, const std::string& url);
    // Restoration constructor (keeps the given ID).
    DesktopDevice(int id, const std::string& name, const std::string& url);

    const std::string& getUrl() const { return url; }

    std::string type() const override { return "desktop"; }
    void print() const override;
    Device* clone() const override;
    void writeFields(std::ostream& os) const override;
};

#endif // DESKTOP_DEVICE_H
