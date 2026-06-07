CXX = g++
CXXFLAGS = -std=c++11 -Wall -Wextra -O2
SRCS = Device.cpp MobileDevice.cpp DesktopDevice.cpp Connection.cpp Server.cpp main.cpp
OBJS = $(SRCS:.cpp=.o)
TARGET = server

all: $(TARGET)

$(TARGET): $(OBJS)
	$(CXX) $(CXXFLAGS) -o $@ $(OBJS)

%.o: %.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@

clean:
	rm -f $(OBJS) $(TARGET) state.log

.PHONY: all clean
