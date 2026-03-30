pipeline {
    agent any

    environment {
        NODE_VERSION = '18'
        CI = 'true'
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

        // STAGE 2: Install dependencies
        stage('Install Dependencies') {
            parallel {
                stage('Client') {
                    steps {
                        echo '========== Installing Client Dependencies =========='
                        dir('client') {
                            sh 'npm install'
                        }
                    }
                }
                stage('Server') {
                    steps {
                        echo '========== Installing Server Dependencies =========='
                        dir('server') {
                            sh 'npm install'
                        }
                    }
                }
            }
        }

        // STAGE 3: Run Tests
        stage('Run Tests') {
            steps {
                echo '========== Running Tests =========='
                dir('client') {
                    sh 'npm test -- --watchAll=false --passWithNoTests'
                }
            }
        }

        // STAGE 4: Build React App
        stage('Build') {
            steps {
                echo '========== Building React App =========='
                dir('client') {
                    sh 'npm run build'
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