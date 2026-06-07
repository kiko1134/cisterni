#include "Device.h"

// IDs start at 1 (matching the examples in the task).
int Device::nextId = 1;

Device::Device(const std::string& n)
    : id(nextId++), name(n) {}

Device::Device(int existingId, const std::string& n)
    : id(existingId), name(n) {
    // Keep the counter ahead of every restored ID so new devices stay unique.
    if (existingId >= nextId) {
        nextId = existingId + 1;
    }
}
