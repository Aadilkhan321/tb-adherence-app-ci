pipeline {
    agent any

    environment {
        NODE_VERSION = '18'
        CI = 'true'
        // ✅ Tell Jenkins exactly where npm is on your Mac
        PATH = "/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:${env.PATH}"
    }

    stages {

        // STAGE 1: Pull code from GitHub
        stage('Checkout') {
            steps {
                echo '========== Pulling code from GitHub =========='
                checkout scm
                sh 'echo "Branch: $GIT_BRANCH"'
                sh 'echo "Commit: $GIT_COMMIT"'
            }
        }

        // STAGE 2: Verify Node & npm are available
        stage('Verify Tools') {
            steps {
                echo '========== Checking Node & npm =========='
                sh '/opt/homebrew/bin/node --version'
                sh '/opt/homebrew/bin/npm --version'
            }
        }

        // STAGE 3: Install dependencies
        stage('Install Dependencies') {
            parallel {
                stage('Client') {
                    steps {
                        echo '========== Installing Client Dependencies =========='
                        dir('client') {
                            sh '/opt/homebrew/bin/npm install'
                        }
                    }
                }
                stage('Server') {
                    steps {
                        echo '========== Installing Server Dependencies =========='
                        dir('server') {
                            sh '/opt/homebrew/bin/npm install'
                        }
                    }
                }
            }
        }

        // STAGE 4: Run Tests
        stage('Run Tests') {
            steps {
                echo '========== Running Tests =========='
                dir('client') {
                    sh '/opt/homebrew/bin/npm test -- --watchAll=false --passWithNoTests'
                }
            }
        }

        // STAGE 5: Build React App
        stage('Build') {
            steps {
                echo '========== Building React App =========='
                dir('client') {
                    sh '/opt/homebrew/bin/npm run build'
                    sh 'echo "✅ Build Successful!"'
                    sh 'du -sh build/'
                }
            }
            post {
                success {
                    echo '✅ Build passed!'
                    archiveArtifacts artifacts: 'client/build/**/*', fingerprint: true
                }
                failure {
                    echo '❌ Build failed!'
                }
            }
        }

    }

    // Final result
    post {
        success {
            echo '🎉 Pipeline SUCCESS — Code is tested and built!'
        }
        failure {
            echo '💥 Pipeline FAILED — Check logs above!'
        }
        always {
            echo '========== Pipeline Finished =========='
        }
    }
}