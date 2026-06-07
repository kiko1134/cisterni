#ifndef SERVER_H
#define SERVER_H

#include "Connection.h"

// Central class managing a fixed number of active sessions.
// Connections live for `timeout` ticks and are terminated automatically.
// A Server object must NOT be copied.
class Server {
    Connection** connections;  // array of owned connections, no holes
    unsigned count;            // number of active connections
    unsigned capacity;         // maximum simultaneous connections
    unsigned timeout;          // expiration threshold in ticks
    unsigned currentTime;      // current time in ticks (starts at 0)

    // Non-copyable.
    Server(const Server&) = delete;
    Server& operator=(const Server&) = delete;

    void clear();               // delete every active connection
    void removeAt(unsigned i);  // delete one connection and compact the array

public:
    Server(unsigned capacity, unsigned timeout);
    ~Server();

    // Adds a new connection for the device. Returns false if the server is full.
    bool connect(const Device& d);

    // Removes the connection of the given device ID and compacts the array.
    void disconnect(int deviceID);

    // Advances time by cnt ticks and drops every expired connection.
    void tick(unsigned cnt = 1);

    // Persists the current set of active connections to a text file.
    void saveLog(const char* filename) const;

    // Replaces the current connections with the data read from the file.
    void loadLog(const char* filename);

    // --- helpers for inspecting the state ---
    void print() const;
    unsigned size() const { return count; }
    unsigned now() const { return currentTime; }
    bool isFull() const { return count >= capacity; }
};

#endif // SERVER_H
