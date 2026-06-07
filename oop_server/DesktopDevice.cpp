#include "DesktopDevice.h"
#include <iostream>
#include <stdexcept>

namespace {
    const std::string& requireNonEmpty(const std::string& url) {
        if (url.empty()) {
            throw std::invalid_argument("DesktopDevice URL must not be empty");
        }
        return url;
    }
}

DesktopDevice::DesktopDevice(const std::string& n, const std::string& u)
    : Device(n), url(requireNonEmpty(u)) {}

DesktopDevice::DesktopDevice(int id, const std::string& n, const std::string& u)
    : Device(id, n), url(requireNonEmpty(u)) {}

void DesktopDevice::print() const {
    std::cout << "[desktop] name: \"" << getName()
              << "\", ID: " << getId()
              << ", URL: " << url << "\n";
}

Device* DesktopDevice::clone() const {
    return new DesktopDevice(*this);  // copy keeps the same ID
}

void DesktopDevice::writeFields(std::ostream& os) const {
    os << url;
}
