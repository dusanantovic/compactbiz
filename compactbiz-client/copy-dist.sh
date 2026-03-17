#!/bin/bash

rm -rf /app/*

rm -r $(ls -A | grep -v dist)

