#ifndef DEVICE_H
#define DEVICE_H

#include <string>
#include <ostream>

// Abstract base class for every client device.
// Each device receives a unique, constant integer ID at creation time.
// IDs are never reused between instances.
class Device {
    static int nextId;      // global counter, guarantees uniqueness
    const int id;           // constant identifier, never changes
    std::string name;       // arbitrary length, may be empty

protected:
    // Restoration constructor (used by loadLog): keeps a specific ID
    // and makes sure future devices will not collide with it.
    Device(int existingId, const std::string& name);

public:
    // Normal constructor: assigns a brand new unique ID.
    explicit Device(const std::string& name);
    virtual ~Device() = default;

    int getId() const { return id; }
    const std::string& getName() const { return name; }

    // Returns the concrete type identifier, e.g. "mobile" / "desktop".
    virtual std::string type() const = 0;

    // Prints type-specific information to standard output.
    virtual void print() const = 0;

    // Polymorphic deep copy (needed for Connection's memory management).
    virtual Device* clone() const = 0;

    // Writes the type-specific fields used in the log file.
    virtual void writeFields(std::ostream& os) const = 0;
};

#endif // DEVICE_H
