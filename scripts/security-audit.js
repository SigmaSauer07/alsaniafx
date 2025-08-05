// Security Audit Script for AlsaniaFX NFT Marketplace
const fs = require('fs');
const path = require('path');

class SecurityAuditor {
    constructor() {
        this.vulnerabilities = [];
        this.warnings = [];
        this.recommendations = [];
    }

    // Run comprehensive security audit
    async runSecurityAudit() {
        console.log('🔒 Starting Security Audit for AlsaniaFX...\n');

        await this.auditSmartContracts();
        await this.auditFrontend();
        await this.auditDependencies();
        await this.auditConfiguration();
        await this.auditDeployment();

        this.generateReport();
    }

    // Audit Smart Contracts
    async auditSmartContracts() {
        console.log('📋 Auditing Smart Contracts...');

        const contractFiles = [
            'contracts/AlsaniaFX.sol',
            'contracts/NFTFactoryUpgradeable.sol'
        ];

        for (const file of contractFiles) {
            if (fs.existsSync(file)) {
                const content = fs.readFileSync(file, 'utf8');
                await this.auditContract(file, content);
            }
        }
    }

    async auditContract(filename, content) {
        // Check for common vulnerabilities
        const checks = [
            {
                name: 'Reentrancy Protection',
                pattern: 'ReentrancyGuard',
                severity: 'HIGH',
                description: 'Reentrancy protection should be implemented'
            },
            {
                name: 'Access Control',
                pattern: 'OwnableUpgradeable',
                severity: 'HIGH',
                description: 'Proper access control should be implemented'
            },
            {
                name: 'Pausable Functionality',
                pattern: 'PausableUpgradeable',
                severity: 'MEDIUM',
                description: 'Emergency pause functionality should be available'
            },
            {
                name: 'Upgradeable Pattern',
                pattern: 'UUPSUpgradeable',
                severity: 'MEDIUM',
                description: 'Upgradeable pattern should be used for future updates'
            },
            {
                name: 'Safe Math',
                pattern: 'SafeMath',
                severity: 'LOW',
                description: 'SafeMath is not needed in Solidity 0.8+ but good to verify'
            },
            {
                name: 'Event Emissions',
                pattern: 'emit ',
                severity: 'LOW',
                description: 'Events should be emitted for important state changes'
            }
        ];

        for (const check of checks) {
            if (content.includes(check.pattern)) {
                this.addFinding('PASS', filename, check.name, check.description);
            } else {
                this.addFinding(check.severity, filename, check.name, `Missing: ${check.description}`);
            }
        }

        // Check for specific vulnerabilities
        const vulnerabilities = [
            {
                name: 'Unchecked External Calls',
                pattern: 'call{',
                severity: 'HIGH',
                description: 'External calls should be checked for success'
            },
            {
                name: 'Unsafe Delegate Call',
                pattern: 'delegatecall',
                severity: 'CRITICAL',
                description: 'Delegate calls can be dangerous if not properly controlled'
            },
            {
                name: 'Unsafe Assembly',
                pattern: 'assembly',
                severity: 'HIGH',
                description: 'Assembly code should be carefully reviewed'
            },
            {
                name: 'Hardcoded Addresses',
                pattern: '0x[0-9a-fA-F]{40}',
                severity: 'MEDIUM',
                description: 'Hardcoded addresses should be avoided'
            }
        ];

        for (const vuln of vulnerabilities) {
            if (content.includes(vuln.pattern)) {
                this.addFinding(vuln.severity, filename, vuln.name, vuln.description);
            }
        }
    }

    // Audit Frontend
    async auditFrontend() {
        console.log('🌐 Auditing Frontend...');

        const frontendFiles = [
            'fx-front/js/web3.js',
            'fx-front/js/marketplace.js',
            'fx-front/js/utils.js'
        ];

        for (const file of frontendFiles) {
            if (fs.existsSync(file)) {
                const content = fs.readFileSync(file, 'utf8');
                await this.auditFrontendFile(file, content);
            }
        }
    }

    async auditFrontendFile(filename, content) {
        const checks = [
            {
                name: 'Input Validation',
                pattern: 'validate|sanitize',
                severity: 'HIGH',
                description: 'User inputs should be validated'
            },
            {
                name: 'XSS Protection',
                pattern: 'innerHTML|outerHTML',
                severity: 'HIGH',
                description: 'Direct HTML insertion should be avoided'
            },
            {
                name: 'CSRF Protection',
                pattern: 'csrf|token',
                severity: 'MEDIUM',
                description: 'CSRF protection should be implemented'
            },
            {
                name: 'Secure Storage',
                pattern: 'localStorage|sessionStorage',
                severity: 'MEDIUM',
                description: 'Sensitive data should not be stored in localStorage'
            }
        ];

        for (const check of checks) {
            if (content.includes(check.pattern)) {
                this.addFinding(check.severity, filename, check.name, check.description);
            }
        }
    }

    // Audit Dependencies
    async auditDependencies() {
        console.log('📦 Auditing Dependencies...');

        if (fs.existsSync('package.json')) {
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            
            // Check for known vulnerable packages
            const vulnerablePackages = [
                'lodash',
                'moment',
                'jquery'
            ];

            const allDeps = {
                ...packageJson.dependencies,
                ...packageJson.devDependencies
            };

            for (const pkg of vulnerablePackages) {
                if (allDeps[pkg]) {
                    this.addFinding('MEDIUM', 'package.json', `Vulnerable Package: ${pkg}`, 
                        'Consider updating or replacing with safer alternatives');
                }
            }
        }
    }

    // Audit Configuration
    async auditConfiguration() {
        console.log('⚙️ Auditing Configuration...');

        const configFiles = [
            'hardhat.config.js',
            '.env.example'
        ];

        for (const file of configFiles) {
            if (fs.existsSync(file)) {
                const content = fs.readFileSync(file, 'utf8');
                await this.auditConfigFile(file, content);
            }
        }
    }

    async auditConfigFile(filename, content) {
        const checks = [
            {
                name: 'Private Keys in Config',
                pattern: 'PRIVATE_KEY',
                severity: 'CRITICAL',
                description: 'Private keys should never be in configuration files'
            },
            {
                name: 'API Keys in Config',
                pattern: 'API_KEY',
                severity: 'HIGH',
                description: 'API keys should be in environment variables'
            },
            {
                name: 'Network Configuration',
                pattern: 'network',
                severity: 'MEDIUM',
                description: 'Network configuration should be properly set'
            }
        ];

        for (const check of checks) {
            if (content.includes(check.pattern)) {
                this.addFinding(check.severity, filename, check.name, check.description);
            }
        }
    }

    // Audit Deployment
    async auditDeployment() {
        console.log('🚀 Auditing Deployment...');

        const deploymentFiles = [
            'scripts/deploy.js',
            'scripts/deploy-production.js'
        ];

        for (const file of deploymentFiles) {
            if (fs.existsSync(file)) {
                const content = fs.readFileSync(file, 'utf8');
                await this.auditDeploymentFile(file, content);
            }
        }
    }

    async auditDeploymentFile(filename, content) {
        const checks = [
            {
                name: 'Contract Verification',
                pattern: 'verify',
                severity: 'MEDIUM',
                description: 'Contracts should be verified on block explorers'
            },
            {
                name: 'Safety Checks',
                pattern: 'require|assert',
                severity: 'HIGH',
                description: 'Deployment should include safety checks'
            },
            {
                name: 'Environment Validation',
                pattern: 'process.env',
                severity: 'MEDIUM',
                description: 'Environment variables should be validated'
            }
        ];

        for (const check of checks) {
            if (content.includes(check.pattern)) {
                this.addFinding('PASS', filename, check.name, check.description);
            } else {
                this.addFinding(check.severity, filename, check.name, `Missing: ${check.description}`);
            }
        }
    }

    // Add finding to audit results
    addFinding(severity, file, issue, description) {
        const finding = {
            severity,
            file,
            issue,
            description,
            timestamp: new Date().toISOString()
        };

        if (severity === 'PASS') {
            // Don't add passes to vulnerabilities
        } else if (severity === 'CRITICAL' || severity === 'HIGH') {
            this.vulnerabilities.push(finding);
        } else {
            this.warnings.push(finding);
        }
    }

    // Generate security report
    generateReport() {
        console.log('\n' + '='.repeat(60));
        console.log('🔒 SECURITY AUDIT REPORT');
        console.log('='.repeat(60));

        // Summary
        console.log(`\n📊 Summary:`);
        console.log(`- Critical Issues: ${this.vulnerabilities.filter(v => v.severity === 'CRITICAL').length}`);
        console.log(`- High Issues: ${this.vulnerabilities.filter(v => v.severity === 'HIGH').length}`);
        console.log(`- Medium Issues: ${this.warnings.filter(w => w.severity === 'MEDIUM').length}`);
        console.log(`- Low Issues: ${this.warnings.filter(w => w.severity === 'LOW').length}`);

        // Critical and High vulnerabilities
        if (this.vulnerabilities.length > 0) {
            console.log(`\n🚨 CRITICAL & HIGH VULNERABILITIES:`);
            this.vulnerabilities.forEach(vuln => {
                console.log(`\n${vuln.severity}: ${vuln.issue}`);
                console.log(`File: ${vuln.file}`);
                console.log(`Description: ${vuln.description}`);
            });
        }

        // Warnings
        if (this.warnings.length > 0) {
            console.log(`\n⚠️ WARNINGS:`);
            this.warnings.forEach(warning => {
                console.log(`\n${warning.severity}: ${warning.issue}`);
                console.log(`File: ${warning.file}`);
                console.log(`Description: ${warning.description}`);
            });
        }

        // Recommendations
        console.log(`\n💡 RECOMMENDATIONS:`);
        console.log(`1. Fix all CRITICAL and HIGH vulnerabilities immediately`);
        console.log(`2. Address MEDIUM issues within 1-2 weeks`);
        console.log(`3. Consider LOW issues for future improvements`);
        console.log(`4. Implement automated security scanning in CI/CD`);
        console.log(`5. Regular security audits (quarterly recommended)`);
        console.log(`6. Consider professional security audit for production`);

        // Save report to file
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                critical: this.vulnerabilities.filter(v => v.severity === 'CRITICAL').length,
                high: this.vulnerabilities.filter(v => v.severity === 'HIGH').length,
                medium: this.warnings.filter(w => w.severity === 'MEDIUM').length,
                low: this.warnings.filter(w => w.severity === 'LOW').length
            },
            vulnerabilities: this.vulnerabilities,
            warnings: this.warnings,
            recommendations: this.recommendations
        };

        fs.writeFileSync('security-audit-report.json', JSON.stringify(report, null, 2));
        console.log(`\n📄 Detailed report saved to: security-audit-report.json`);

        // Final assessment
        const criticalCount = this.vulnerabilities.filter(v => v.severity === 'CRITICAL').length;
        const highCount = this.vulnerabilities.filter(v => v.severity === 'HIGH').length;

        if (criticalCount > 0) {
            console.log(`\n❌ CRITICAL: ${criticalCount} critical vulnerabilities found. DO NOT DEPLOY!`);
        } else if (highCount > 0) {
            console.log(`\n⚠️ WARNING: ${highCount} high vulnerabilities found. Fix before deployment.`);
        } else {
            console.log(`\n✅ GOOD: No critical or high vulnerabilities found.`);
        }
    }
}

// Run security audit
const auditor = new SecurityAuditor();
auditor.runSecurityAudit().catch(console.error); 