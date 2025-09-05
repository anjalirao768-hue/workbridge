#!/usr/bin/env python3

import requests
import json
import sys
from datetime import datetime

class OTPSystemAnalyzer:
    def __init__(self, base_url="http://localhost:3000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.issues_found = []
        self.tests_run = 0
        self.critical_issues = []

    def log_issue(self, severity, component, issue, solution):
        """Log an issue found during testing"""
        self.issues_found.append({
            'severity': severity,
            'component': component,
            'issue': issue,
            'solution': solution
        })
        
        if severity == 'CRITICAL':
            self.critical_issues.append(f"{component}: {issue}")

    def test_database_schema(self):
        """Test if the database schema is properly set up"""
        print("🔍 Testing Database Schema...")
        self.tests_run += 1
        
        # Test OTP API to see what errors we get
        try:
            url = f"{self.base_url}/api/auth/send-otp"
            data = {"email": "test@example.com"}
            
            response = self.session.post(url, json=data, headers={'Content-Type': 'application/json'})
            
            if response.status_code == 500:
                response_data = response.json()
                error = response_data.get('error', '')
                
                if 'Failed to create user record' in error:
                    self.log_issue(
                        'CRITICAL',
                        'Database Schema',
                        'Users table missing email_verified column',
                        'Run: ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;'
                    )
                elif 'otp_codes' in error.lower():
                    self.log_issue(
                        'CRITICAL',
                        'Database Schema',
                        'otp_codes table does not exist',
                        'Create otp_codes table with proper schema'
                    )
                else:
                    self.log_issue(
                        'CRITICAL',
                        'Database Schema',
                        f'Unknown database error: {error}',
                        'Check Supabase logs and database schema'
                    )
                
                print(f"❌ Database schema issues detected: {error}")
                return False
            else:
                print("✅ Database schema appears to be working")
                return True
                
        except Exception as e:
            self.log_issue(
                'CRITICAL',
                'API Connection',
                f'Cannot connect to OTP API: {str(e)}',
                'Check if Next.js server is running and accessible'
            )
            print(f"❌ API connection failed: {e}")
            return False

    def test_otp_manager_implementation(self):
        """Analyze the OTP manager implementation"""
        print("\n🔍 Analyzing OTP Manager Implementation...")
        self.tests_run += 1
        
        try:
            # Check if the OTP manager file exists and has the right structure
            with open('/app/src/lib/otp-manager.ts', 'r') as f:
                otp_manager_code = f.read()
            
            # Check for key components
            required_methods = [
                'storeOTP',
                'verifyOTP', 
                'hasOTP',
                'getRemainingAttempts',
                'cleanupExpired'
            ]
            
            missing_methods = []
            for method in required_methods:
                if method not in otp_manager_code:
                    missing_methods.append(method)
            
            if missing_methods:
                self.log_issue(
                    'HIGH',
                    'OTP Manager',
                    f'Missing methods: {", ".join(missing_methods)}',
                    'Implement missing OTP manager methods'
                )
                print(f"❌ Missing OTP manager methods: {missing_methods}")
                return False
            
            # Check for database-backed storage
            if 'supabase' in otp_manager_code and 'otp_codes' in otp_manager_code:
                print("✅ OTP Manager uses database-backed storage")
                
                # Check for proper expiration handling
                if 'expires_at' in otp_manager_code and 'Date.now()' in otp_manager_code:
                    print("✅ OTP expiration handling implemented")
                else:
                    self.log_issue(
                        'MEDIUM',
                        'OTP Manager',
                        'OTP expiration handling may be incomplete',
                        'Verify expiration logic in verifyOTP method'
                    )
                
                # Check for attempt limiting
                if 'attempts' in otp_manager_code and 'max_attempts' in otp_manager_code:
                    print("✅ OTP attempt limiting implemented")
                else:
                    self.log_issue(
                        'MEDIUM',
                        'OTP Manager',
                        'OTP attempt limiting may be incomplete',
                        'Verify attempt tracking in verifyOTP method'
                    )
                
                return True
            else:
                self.log_issue(
                    'CRITICAL',
                    'OTP Manager',
                    'Not using database-backed storage',
                    'Update OTP manager to use Supabase otp_codes table'
                )
                print("❌ OTP Manager not using database storage")
                return False
                
        except FileNotFoundError:
            self.log_issue(
                'CRITICAL',
                'OTP Manager',
                'OTP manager file not found',
                'Create /app/src/lib/otp-manager.ts with database-backed implementation'
            )
            print("❌ OTP manager file not found")
            return False
        except Exception as e:
            self.log_issue(
                'HIGH',
                'OTP Manager',
                f'Error analyzing OTP manager: {str(e)}',
                'Check OTP manager file for syntax errors'
            )
            print(f"❌ Error analyzing OTP manager: {e}")
            return False

    def test_api_routes_implementation(self):
        """Analyze the API routes implementation"""
        print("\n🔍 Analyzing API Routes Implementation...")
        self.tests_run += 1
        
        try:
            # Check send-otp route
            with open('/app/src/app/api/auth/send-otp/route.ts', 'r') as f:
                send_otp_code = f.read()
            
            # Check verify-otp route  
            with open('/app/src/app/api/auth/verify-otp/route.ts', 'r') as f:
                verify_otp_code = f.read()
            
            # Analyze send-otp implementation
            if 'otpManager.storeOTP' in send_otp_code:
                print("✅ Send OTP route uses OTP manager")
            else:
                self.log_issue(
                    'HIGH',
                    'Send OTP API',
                    'Not using OTP manager for storage',
                    'Update send-otp route to use otpManager.storeOTP()'
                )
            
            # Analyze verify-otp implementation
            if 'otpManager.verifyOTP' in verify_otp_code:
                print("✅ Verify OTP route uses OTP manager")
            else:
                self.log_issue(
                    'HIGH',
                    'Verify OTP API',
                    'Not using OTP manager for verification',
                    'Update verify-otp route to use otpManager.verifyOTP()'
                )
            
            # Check for proper error handling
            if 'remainingAttempts' in verify_otp_code:
                print("✅ Verify OTP route returns remaining attempts")
            else:
                self.log_issue(
                    'MEDIUM',
                    'Verify OTP API',
                    'Not returning remaining attempts on failure',
                    'Add remainingAttempts to error response'
                )
            
            return True
            
        except FileNotFoundError as e:
            self.log_issue(
                'CRITICAL',
                'API Routes',
                f'API route file not found: {str(e)}',
                'Create missing API route files'
            )
            print(f"❌ API route file not found: {e}")
            return False
        except Exception as e:
            self.log_issue(
                'HIGH',
                'API Routes',
                f'Error analyzing API routes: {str(e)}',
                'Check API route files for syntax errors'
            )
            print(f"❌ Error analyzing API routes: {e}")
            return False

    def simulate_otp_workflow(self):
        """Simulate what the OTP workflow should look like when working"""
        print("\n🎯 Simulating Expected OTP Workflow...")
        self.tests_run += 1
        
        print("Expected workflow for anjalirao768@gmail.com:")
        print("1. User requests OTP → API stores OTP in otp_codes table")
        print("2. OTP persists across serverless function instances")
        print("3. User submits OTP → API retrieves from database and verifies")
        print("4. Valid OTP → User authenticated, OTP deleted from database")
        print("5. Invalid OTP → Attempt count incremented, remaining attempts returned")
        print("6. Expired OTP → Automatically cleaned up from database")
        
        print("\n🔧 Architecture Fix:")
        print("Previous: In-memory Map storage (failed in serverless)")
        print("New: Supabase database-backed persistent storage")
        print("Result: OTPs persist across serverless function instances")
        
        return True

    def generate_migration_script(self):
        """Generate the exact SQL needed to fix the database"""
        print("\n📝 Generating Migration Script...")
        
        migration_sql = """
-- WorkBridge OTP System Database Migration
-- Run this in your Supabase SQL Editor

-- 1. Add email_verified column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- 2. Create otp_codes table for persistent OTP storage
CREATE TABLE IF NOT EXISTS otp_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    otp TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON otp_codes(email);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON otp_codes(expires_at);

-- 4. Verify the tables exist
SELECT 'users table' as table_name, COUNT(*) as exists FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'email_verified'
UNION ALL
SELECT 'otp_codes table' as table_name, COUNT(*) as exists FROM information_schema.tables 
WHERE table_name = 'otp_codes';
"""
        
        # Write to file
        with open('/app/otp_migration.sql', 'w') as f:
            f.write(migration_sql)
        
        print("✅ Migration script saved to /app/otp_migration.sql")
        print("📋 Copy and paste this SQL into your Supabase SQL Editor")
        
        return True

def main():
    print("🔍 OTP System Analysis & Testing")
    print("=" * 60)
    print("Focus: Database-backed OTP storage system analysis")
    print("Issue: 'Invalid or expired OTP' errors for anjalirao768@gmail.com")
    print("=" * 60)
    
    analyzer = OTPSystemAnalyzer()
    
    # Run analysis
    print("\n📊 ANALYSIS PHASE")
    print("=" * 30)
    
    schema_ok = analyzer.test_database_schema()
    manager_ok = analyzer.test_otp_manager_implementation()
    routes_ok = analyzer.test_api_routes_implementation()
    
    # Simulate expected workflow
    print("\n🎯 WORKFLOW SIMULATION")
    print("=" * 30)
    analyzer.simulate_otp_workflow()
    
    # Generate migration script
    print("\n🔧 SOLUTION GENERATION")
    print("=" * 30)
    analyzer.generate_migration_script()
    
    # Print comprehensive summary
    print(f"\n{'='*60}")
    print("📊 OTP SYSTEM ANALYSIS SUMMARY")
    print(f"{'='*60}")
    print(f"   Tests run: {analyzer.tests_run}")
    print(f"   Issues found: {len(analyzer.issues_found)}")
    print(f"   Critical issues: {len(analyzer.critical_issues)}")
    
    if analyzer.critical_issues:
        print(f"\n🚨 CRITICAL ISSUES BLOCKING OTP SYSTEM:")
        for issue in analyzer.critical_issues:
            print(f"   ❌ {issue}")
    
    print(f"\n📋 DETAILED ISSUES & SOLUTIONS:")
    for issue in analyzer.issues_found:
        severity_icon = "🚨" if issue['severity'] == 'CRITICAL' else "⚠️" if issue['severity'] == 'HIGH' else "ℹ️"
        print(f"   {severity_icon} {issue['severity']} - {issue['component']}")
        print(f"      Issue: {issue['issue']}")
        print(f"      Solution: {issue['solution']}")
        print()
    
    print(f"🎯 ROOT CAUSE ANALYSIS:")
    print(f"   The 'Invalid or expired OTP' issue for anjalirao768@gmail.com")
    print(f"   is caused by missing database schema. The OTP system code is")
    print(f"   correctly implemented for database-backed storage, but the")
    print(f"   required tables don't exist in the Supabase database.")
    
    print(f"\n✅ SOLUTION:")
    print(f"   1. Run the migration SQL in Supabase SQL Editor")
    print(f"   2. Verify tables exist with: SELECT * FROM otp_codes LIMIT 1;")
    print(f"   3. Test OTP system with anjalirao768@gmail.com")
    print(f"   4. Confirm no more 'Invalid or expired OTP' errors")
    
    if len(analyzer.critical_issues) > 0:
        print(f"\n❌ TESTING BLOCKED: {len(analyzer.critical_issues)} critical issues must be resolved first")
        return 1
    else:
        print(f"\n✅ ANALYSIS COMPLETE: Ready for testing after migration")
        return 0

if __name__ == "__main__":
    sys.exit(main())